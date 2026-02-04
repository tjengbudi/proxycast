/**
 * @file index.ts
 * @description 海报 Agent 模块导出和注册
 * @module components/content-creator/agents/poster
 */

import { RequirementAgent } from "./RequirementAgent";
import { StyleAgent } from "./StyleAgent";
import { LayoutAgent } from "./LayoutAgent";
import { ContentAgent } from "./ContentAgent";
import { RefineAgent } from "./RefineAgent";
import { ExportAgent } from "./ExportAgent";
import type { BaseAgent } from "../base/BaseAgent";
import type { PosterAgentId } from "../base/types";

/**
 * 海报 Agent 注册表
 */
export const posterAgents: Record<PosterAgentId, BaseAgent> = {
  requirement: new RequirementAgent(),
  style: new StyleAgent(),
  layout: new LayoutAgent(),
  content: new ContentAgent(),
  refine: new RefineAgent(),
  export: new ExportAgent(),
};

/**
 * 获取海报 Agent
 *
 * @param id - Agent ID
 * @returns Agent 实例
 */
export function getPosterAgent(id: PosterAgentId): BaseAgent | undefined {
  return posterAgents[id];
}

/**
 * 获取所有海报 Agent
 *
 * @returns Agent 列表
 */
export function getAllPosterAgents(): BaseAgent[] {
  return Object.values(posterAgents);
}

// 导出各个 Agent 类
export { RequirementAgent } from "./RequirementAgent";
export { StyleAgent } from "./StyleAgent";
export { LayoutAgent } from "./LayoutAgent";
export { ContentAgent } from "./ContentAgent";
export { RefineAgent } from "./RefineAgent";
export { ExportAgent } from "./ExportAgent";
