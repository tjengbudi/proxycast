/**
 * @file index.ts
 * @description Agent 模块导出
 * @module components/content-creator/agents
 */

// 基础模块
export * from "./base";

// 海报 Agent
export * from "./poster";

// 调度器
export {
  PosterAgentScheduler,
  posterAgentScheduler,
  POSTER_WORKFLOWS,
} from "./AgentScheduler";

// UI 组件
export { AgentChatPanel } from "./AgentChatPanel";
export type {
  ChatMessage,
  MessageRole,
  QuickCommand,
  AgentChatPanelProps,
} from "./AgentChatPanel";
