//! Claude Custom Provider (自定义 Claude API)
use serde::{Deserialize, Serialize};
use std::error::Error;
use reqwest::Client;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ClaudeCustomConfig {
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub enabled: bool,
}

pub struct ClaudeCustomProvider {
    pub config: ClaudeCustomConfig,
    pub client: Client,
}

impl ClaudeCustomProvider {
    pub fn new() -> Self {
        Self {
            config: ClaudeCustomConfig::default(),
            client: Client::new(),
        }
    }

    pub fn get_base_url(&self) -> String {
        self.config.base_url
            .clone()
            .unwrap_or_else(|| "https://api.anthropic.com".to_string())
    }

    pub fn is_configured(&self) -> bool {
        self.config.api_key.is_some() && self.config.enabled
    }

    pub async fn messages(
        &self,
        request: &serde_json::Value,
    ) -> Result<reqwest::Response, Box<dyn Error + Send + Sync>> {
        let api_key = self.config.api_key.as_ref()
            .ok_or("Claude API key not configured")?;

        let base_url = self.get_base_url();
        let url = format!("{}/v1/messages", base_url);

        let resp = self.client
            .post(&url)
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(request)
            .send()
            .await?;

        Ok(resp)
    }

    pub async fn count_tokens(
        &self,
        request: &serde_json::Value,
    ) -> Result<serde_json::Value, Box<dyn Error + Send + Sync>> {
        let api_key = self.config.api_key.as_ref()
            .ok_or("Claude API key not configured")?;

        let base_url = self.get_base_url();
        let url = format!("{}/v1/messages/count_tokens", base_url);

        let resp = self.client
            .post(&url)
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(request)
            .send()
            .await?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            return Err(format!("Failed to count tokens: {} - {}", status, body).into());
        }

        let data: serde_json::Value = resp.json().await?;
        Ok(data)
    }
}
