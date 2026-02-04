/**
 * @file index.ts
 * @description 海报工作流模块导出
 * @module components/content-creator/workflows/poster
 */

// 类型导出
export type {
  WorkflowStepStatus,
  InputFieldType,
  InputField,
  WorkflowStep,
  WorkflowPrompt,
  WorkflowStepState,
  WorkflowTemplate,
  WorkflowCategory,
  WorkflowConfig,
  WorkflowState,
  WorkflowEvent,
  WorkflowCallbacks,
  WorkflowContext,
  SuggestedDimension,
} from "./types";

// 工作流模板导出
export { ecommercePromoWorkflow } from "./ecommerce-promo";
export { brandImageWorkflow } from "./brand-image";
export { socialMediaWorkflow } from "./social-media";

// UI 组件导出
export { PosterWorkflowPanel } from "./PosterWorkflowPanel";
export type { PosterWorkflowPanelProps } from "./PosterWorkflowPanel";

import { ecommercePromoWorkflow } from "./ecommerce-promo";
import { brandImageWorkflow } from "./brand-image";
import { socialMediaWorkflow } from "./social-media";
import type { WorkflowTemplate, WorkflowCategory } from "./types";

/**
 * 所有工作流模板
 */
export const allWorkflowTemplates: WorkflowTemplate[] = [
  ecommercePromoWorkflow,
  brandImageWorkflow,
  socialMediaWorkflow,
];

/**
 * 工作流模板注册表
 */
export const workflowTemplateRegistry: Record<string, WorkflowTemplate> = {
  "ecommerce-promo": ecommercePromoWorkflow,
  "brand-image": brandImageWorkflow,
  "social-media": socialMediaWorkflow,
};

/**
 * 获取工作流模板
 *
 * @param id - 工作流 ID
 * @returns 工作流模板
 */
export function getWorkflowTemplate(id: string): WorkflowTemplate | undefined {
  return workflowTemplateRegistry[id];
}

/**
 * 按分类获取工作流模板
 *
 * @param category - 工作流分类
 * @returns 工作流模板列表
 */
export function getWorkflowsByCategory(
  category: WorkflowCategory,
): WorkflowTemplate[] {
  return allWorkflowTemplates.filter((w) => w.category === category);
}

/**
 * 搜索工作流模板
 *
 * @param query - 搜索关键词
 * @returns 匹配的工作流模板列表
 */
export function searchWorkflows(query: string): WorkflowTemplate[] {
  const lowerQuery = query.toLowerCase();
  return allWorkflowTemplates.filter(
    (w) =>
      w.name.toLowerCase().includes(lowerQuery) ||
      w.description.toLowerCase().includes(lowerQuery) ||
      w.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  );
}
