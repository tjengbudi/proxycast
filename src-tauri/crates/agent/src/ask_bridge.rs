//! Ask 工具桥接
//!
//! 将 aster 的 AskTool 回调桥接到 ActionRequiredManager，
//! 通过 elicitation 事件把问题发送到前端并等待用户输入。

use aster::action_required_manager::ActionRequiredManager;
use aster::tools::AskCallback;
use serde_json::{json, Value};
use std::time::Duration;

const DEFAULT_ASK_TIMEOUT_SECS: u64 = 300;

/// 创建 AskTool 回调
pub fn create_ask_callback() -> AskCallback {
    std::sync::Arc::new(|question: String, options: Option<Vec<String>>| {
        Box::pin(async move {
            let requested_schema = build_requested_schema(&question, options.as_deref());

            match ActionRequiredManager::global()
                .request_and_wait(
                    question.clone(),
                    requested_schema,
                    Duration::from_secs(DEFAULT_ASK_TIMEOUT_SECS),
                )
                .await
            {
                Ok(user_data) => extract_response(&user_data),
                Err(err) => {
                    tracing::warn!(
                        "[AsterAgent][AskBridge] 用户输入等待失败: question='{}', err={}",
                        question,
                        err
                    );
                    None
                }
            }
        })
    })
}

/// 构建 elicitation 的请求 schema
fn build_requested_schema(question: &str, options: Option<&[String]>) -> Value {
    if let Some(options) = options {
        let options: Vec<Value> = options.iter().map(|item| json!(item)).collect();
        json!({
            "type": "object",
            "properties": {
                "answer": {
                    "type": "string",
                    "description": question,
                    "enum": options
                },
                "other": {
                    "type": "string",
                    "description": "可选：自由输入答案"
                }
            },
            "required": ["answer"]
        })
    } else {
        json!({
            "type": "object",
            "properties": {
                "answer": {
                    "type": "string",
                    "description": question
                }
            },
            "required": ["answer"]
        })
    }
}

/// 从前端回传的 user_data 中提取可用于 AskTool 的字符串答案
pub fn extract_response(user_data: &Value) -> Option<String> {
    match user_data {
        Value::String(s) => {
            let value = s.trim();
            if value.is_empty() {
                None
            } else {
                Some(value.to_string())
            }
        }
        Value::Object(map) => {
            if let Some(Value::String(other)) = map.get("other") {
                let trimmed = other.trim();
                if !trimmed.is_empty() {
                    return Some(trimmed.to_string());
                }
            }

            if let Some(Value::String(answer)) = map.get("answer") {
                let trimmed = answer.trim();
                if !trimmed.is_empty() {
                    return Some(trimmed.to_string());
                }
            }

            // 兼容 ask_user 场景可能返回的任意对象，降级为 JSON 字符串
            serde_json::to_string(user_data)
                .ok()
                .filter(|s| !s.is_empty())
        }
        _ => serde_json::to_string(user_data)
            .ok()
            .filter(|s| !s.is_empty()),
    }
}
