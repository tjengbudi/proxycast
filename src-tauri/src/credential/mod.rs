//! 凭证池管理模块
//!
//! 提供多凭证管理、负载均衡和健康检查功能
//!
//! ## 模块结构
//!
//! - `types` - 凭证相关类型定义（来自 proxycast-core）
//! - `pool` - 凭证池管理（来自 proxycast-core）
//! - `health` - 健康检查（来自 proxycast-core）
//! - `risk` - 风控模块（来自 proxycast-core）
//! - `balancer` - 负载均衡策略（本地）
//! - `quota` - 配额管理（本地）
//! - `sync` - 数据库同步（本地）

// 从 proxycast-core 重新导出核心类型模块
pub use proxycast_core::credential::{health, pool, risk, types};

// 本地模块（依赖 infra 或 Tauri）
mod balancer;
mod quota;
mod sync;

// 重新导出 core 类型
pub use proxycast_core::credential::{
    CooldownConfig, Credential, CredentialData, CredentialPool, CredentialStats, CredentialStatus,
    HealthCheckConfig, HealthCheckResult, HealthChecker, HealthStatus, PoolError, PoolStatus,
    RateLimitEvent, RateLimitStats, RiskController, RiskLevel,
};

// 重新导出本地类型
pub use balancer::{BalanceStrategy, CooldownInfo, CredentialSelection, LoadBalancer};
pub use quota::{
    create_shared_quota_manager, start_quota_cleanup_task, AllCredentialsExhaustedError,
    QuotaAutoSwitchResult, QuotaExceededRecord, QuotaManager,
};
pub use sync::{CredentialSyncService, SyncError};

#[cfg(test)]
mod tests;
