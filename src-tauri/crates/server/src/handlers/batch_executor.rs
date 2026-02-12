//! 批量任务执行器
//!
//! 负责异步执行批量任务，支持并发控制、重试、超时和取消

use std::collections::HashMap;
use std::sync::Arc;

use axum::http::StatusCode;
use proxycast_core::models::openai::{
    ChatCompletionRequest, ChatCompletionResponse, ChatMessage, MessageContent,
};
use proxycast_scheduler::{BatchTaskDao, BatchTaskStatus, TaskResult, TemplateDao, TokenUsage};
use tokio::sync::RwLock;
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

use crate::AppState;

/// 批量任务执行器
#[derive(Clone)]
pub struct BatchTaskExecutor {
    state: AppState,
    cancel_tokens: Arc<RwLock<HashMap<Uuid, CancellationToken>>>,
}

impl BatchTaskExecutor {
    pub fn new(state: AppState) -> Self {
        Self {
            state,
            cancel_tokens: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// 启动批量任务执行（spawn 后台任务）
    pub async fn start_batch(&self, batch_id: Uuid) {
        let cancel_token = CancellationToken::new();
        self.cancel_tokens
            .write()
            .await
            .insert(batch_id, cancel_token.clone());

        let state = self.state.clone();
        let cancel_tokens = self.cancel_tokens.clone();

        tokio::spawn(async move {
            Self::execute_batch(state, batch_id, cancel_token).await;
            // 执行完毕后清理 cancel token
            cancel_tokens.write().await.remove(&batch_id);
        });
    }

    /// 取消运行中的批量任务
    pub async fn cancel_batch(&self, batch_id: &Uuid) -> bool {
        if let Some(token) = self.cancel_tokens.read().await.get(batch_id) {
            token.cancel();
            true
        } else {
            false
        }
    }

    /// 核心执行逻辑
    async fn execute_batch(state: AppState, batch_id: Uuid, cancel_token: CancellationToken) {
        let db = match &state.db {
            Some(db) => db,
            None => {
                tracing::error!("[BATCH] 数据库未初始化, batch_id={}", batch_id);
                return;
            }
        };

        // 1. 从 DB 加载 BatchTask
        let mut batch_task = match BatchTaskDao::get_by_id(db, &batch_id) {
            Ok(Some(task)) => task,
            Ok(None) => {
                tracing::error!("[BATCH] 批量任务不存在: {}", batch_id);
                return;
            }
            Err(e) => {
                tracing::error!("[BATCH] 加载批量任务失败: {}", e);
                return;
            }
        };

        // 2. 加载模板
        let template = match TemplateDao::get_by_id(db, &batch_task.template_id) {
            Ok(Some(t)) => t,
            Ok(None) => {
                tracing::error!("[BATCH] 模板不存在: {}", batch_task.template_id);
                let _ = BatchTaskDao::update_status(db, &batch_id, BatchTaskStatus::Failed);
                return;
            }
            Err(e) => {
                tracing::error!("[BATCH] 加载模板失败: {}", e);
                let _ = BatchTaskDao::update_status(db, &batch_id, BatchTaskStatus::Failed);
                return;
            }
        };

        // 3. 更新状态为 Running
        let now = chrono::Utc::now();
        batch_task.status = BatchTaskStatus::Running;
        batch_task.started_at = Some(now);
        let _ = BatchTaskDao::update_results(
            db,
            &batch_id,
            BatchTaskStatus::Running,
            &batch_task.results,
            batch_task.started_at,
            None,
        );

        tracing::info!(
            "[BATCH] 开始执行批量任务: id={}, name={}, task_count={}",
            batch_id,
            batch_task.name,
            batch_task.tasks.len()
        );

        // 4. 用 Semaphore 控制并发
        let concurrency = batch_task.options.concurrency.max(1);
        let semaphore = Arc::new(tokio::sync::Semaphore::new(concurrency));
        let results = Arc::new(RwLock::new(Vec::<TaskResult>::new()));
        let mut handles = Vec::new();

        for task_def in &batch_task.tasks {
            let task_id = task_def.id.unwrap_or_else(Uuid::new_v4);
            let variables = task_def.variables.clone();
            let sem = semaphore.clone();
            let state = state.clone();
            let cancel = cancel_token.clone();
            let results = results.clone();
            let model = template.model.clone();
            let system_prompt = template.system_prompt.clone();
            let user_message = template.render_user_message(&variables);
            let temperature = template.temperature;
            let max_tokens = template.max_tokens;
            let retry_count = batch_task.options.retry_count;
            let timeout_secs = batch_task.options.timeout_seconds;
            let db_clone = db.clone();
            let batch_id_clone = batch_id;

            let handle = tokio::spawn(async move {
                let _permit = sem.acquire().await.unwrap();

                // 检查取消
                if cancel.is_cancelled() {
                    let result = TaskResult {
                        task_id,
                        status: proxycast_scheduler::BatchTaskStatus2::Cancelled,
                        content: None,
                        error: Some("任务已取消".to_string()),
                        usage: TokenUsage::default(),
                        started_at: chrono::Utc::now(),
                        completed_at: Some(chrono::Utc::now()),
                    };
                    results.write().await.push(result);
                    return;
                }

                let result = Self::execute_single_task(
                    &state,
                    task_id,
                    &model,
                    system_prompt.as_deref(),
                    &user_message,
                    temperature,
                    max_tokens,
                    retry_count,
                    timeout_secs,
                    &cancel,
                )
                .await;

                results.write().await.push(result);

                // 实时更新 DB 进度
                let current_results = results.read().await.clone();
                let _ = BatchTaskDao::update_results(
                    &db_clone,
                    &batch_id_clone,
                    BatchTaskStatus::Running,
                    &current_results,
                    None,
                    None,
                );
            });

            handles.push(handle);
        }

        // 等待所有任务完成
        for handle in handles {
            let _ = handle.await;
        }

        // 5. 计算最终状态
        let final_results = results.read().await.clone();
        let total = batch_task.tasks.len();
        let completed = final_results
            .iter()
            .filter(|r| r.status == proxycast_scheduler::BatchTaskStatus2::Completed)
            .count();
        let cancelled = final_results
            .iter()
            .filter(|r| r.status == proxycast_scheduler::BatchTaskStatus2::Cancelled)
            .count();

        let final_status = if cancel_token.is_cancelled() {
            BatchTaskStatus::Cancelled
        } else if completed == total {
            BatchTaskStatus::Completed
        } else if completed == 0 {
            BatchTaskStatus::Failed
        } else {
            BatchTaskStatus::PartiallyCompleted
        };

        let completed_at = chrono::Utc::now();
        let _ = BatchTaskDao::update_results(
            db,
            &batch_id,
            final_status,
            &final_results,
            batch_task.started_at,
            Some(completed_at),
        );

        tracing::info!(
            "[BATCH] 批量任务完成: id={}, status={:?}, completed={}/{}, cancelled={}",
            batch_id,
            final_status,
            completed,
            total,
            cancelled
        );
    }

    /// 执行单个子任务（含重试和超时）
    async fn execute_single_task(
        state: &AppState,
        task_id: Uuid,
        model: &str,
        system_prompt: Option<&str>,
        user_message: &str,
        temperature: Option<f32>,
        max_tokens: Option<u32>,
        retry_count: usize,
        timeout_secs: u64,
        cancel: &CancellationToken,
    ) -> TaskResult {
        let started_at = chrono::Utc::now();
        let max_attempts = retry_count + 1;

        for attempt in 0..max_attempts {
            if cancel.is_cancelled() {
                return TaskResult {
                    task_id,
                    status: proxycast_scheduler::BatchTaskStatus2::Cancelled,
                    content: None,
                    error: Some("任务已取消".to_string()),
                    usage: TokenUsage::default(),
                    started_at,
                    completed_at: Some(chrono::Utc::now()),
                };
            }

            if attempt > 0 {
                tracing::info!(
                    "[BATCH] 重试任务: task_id={}, attempt={}/{}",
                    task_id,
                    attempt + 1,
                    max_attempts
                );
            }

            // 构建请求
            let mut messages = Vec::new();
            if let Some(sys) = system_prompt {
                messages.push(ChatMessage {
                    role: "system".to_string(),
                    content: Some(MessageContent::Text(sys.to_string())),
                    tool_calls: None,
                    tool_call_id: None,
                    reasoning_content: None,
                });
            }
            messages.push(ChatMessage {
                role: "user".to_string(),
                content: Some(MessageContent::Text(user_message.to_string())),
                tool_calls: None,
                tool_call_id: None,
                reasoning_content: None,
            });

            let request = ChatCompletionRequest {
                model: model.to_string(),
                messages,
                temperature,
                max_tokens,
                top_p: None,
                stream: false,
                tools: None,
                tool_choice: None,
                reasoning_effort: None,
            };

            // 调用 LLM（带超时）
            let result = tokio::time::timeout(
                std::time::Duration::from_secs(timeout_secs),
                Self::call_llm(state, &request),
            )
            .await;

            match result {
                Ok(Ok((content, usage))) => {
                    return TaskResult {
                        task_id,
                        status: proxycast_scheduler::BatchTaskStatus2::Completed,
                        content: Some(content),
                        error: None,
                        usage,
                        started_at,
                        completed_at: Some(chrono::Utc::now()),
                    };
                }
                Ok(Err(e)) => {
                    if attempt == max_attempts - 1 {
                        return TaskResult {
                            task_id,
                            status: proxycast_scheduler::BatchTaskStatus2::Failed,
                            content: None,
                            error: Some(e),
                            usage: TokenUsage::default(),
                            started_at,
                            completed_at: Some(chrono::Utc::now()),
                        };
                    }
                    // 重试前等待
                    tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                }
                Err(_) => {
                    if attempt == max_attempts - 1 {
                        return TaskResult {
                            task_id,
                            status: proxycast_scheduler::BatchTaskStatus2::Failed,
                            content: None,
                            error: Some(format!("任务超时 ({}s)", timeout_secs)),
                            usage: TokenUsage::default(),
                            started_at,
                            completed_at: Some(chrono::Utc::now()),
                        };
                    }
                    tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                }
            }
        }

        // 不应到达这里
        TaskResult {
            task_id,
            status: proxycast_scheduler::BatchTaskStatus2::Failed,
            content: None,
            error: Some("未知错误".to_string()),
            usage: TokenUsage::default(),
            started_at,
            completed_at: Some(chrono::Utc::now()),
        }
    }

    /// 调用 LLM：选择凭证 + 调用 provider
    async fn call_llm(
        state: &AppState,
        request: &ChatCompletionRequest,
    ) -> Result<(String, TokenUsage), String> {
        let db = state.db.as_ref().ok_or("数据库未初始化")?;

        // 选择凭证
        let credential = state
            .pool_service
            .select_credential_with_fallback(
                db,
                &state.api_key_service,
                "",
                Some(&request.model),
                None,
                None,
            )
            .await?
            .ok_or_else(|| format!("没有可用的凭证来调用模型: {}", request.model))?;

        // 调用 provider
        let response =
            super::provider_calls::call_provider_openai(state, &credential, request, None).await;

        // 解析响应
        let status = response.status();
        let body = axum::body::to_bytes(response.into_body(), 10 * 1024 * 1024)
            .await
            .map_err(|e| format!("读取响应体失败: {}", e))?;

        if status != StatusCode::OK {
            let error_text = String::from_utf8_lossy(&body);
            return Err(format!("LLM 调用失败 ({}): {}", status, error_text));
        }

        let resp: ChatCompletionResponse =
            serde_json::from_slice(&body).map_err(|e| format!("解析响应失败: {}", e))?;

        let content = resp
            .choices
            .first()
            .and_then(|c| c.message.content.clone())
            .unwrap_or_default();

        let usage = TokenUsage::new(resp.usage.prompt_tokens, resp.usage.completion_tokens);

        Ok((content, usage))
    }
}
