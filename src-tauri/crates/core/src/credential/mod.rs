//! 凭证池核心类型和独立逻辑
//!
//! 包含凭证类型定义、凭证池管理、健康检查和风控模块。
//! 负载均衡器（balancer）、配额管理（quota）和同步服务（sync）
//! 因依赖 infra crate 保留在主 crate 中。

pub mod health;
pub mod pool;
pub mod risk;
pub mod types;

pub use health::{HealthCheckConfig, HealthCheckResult, HealthChecker, HealthStatus};
pub use pool::{CredentialPool, PoolError, PoolStatus};
pub use risk::{CooldownConfig, RateLimitEvent, RateLimitStats, RiskController, RiskLevel};
pub use types::{Credential, CredentialData, CredentialStats, CredentialStatus};
