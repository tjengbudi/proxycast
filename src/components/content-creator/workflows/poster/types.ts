/**
 * @file types.ts
 * @description 海报工作流类型定义
 * @module components/content-creator/workflows/poster/types
 */

import type { PosterAgentId } from "../../agents/base/types";

/**
 * 工作流步骤状态
 */
export type WorkflowStepStatus =
  | "pending"
  | "active"
  | "completed"
  | "skipped"
  | "error";

/**
 * 输入字段类型
 */
export type InputFieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "color"
  | "image"
  | "number";

/**
 * 输入字段定义
 */
export interface InputField {
  /** 字段键名 */
  key: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: InputFieldType;
  /** 占位符文本 */
  placeholder?: string;
  /** 选项列表（用于 select/multiselect） */
  options?: string[];
  /** 是否必填 */
  required: boolean;
  /** 默认值 */
  defaultValue?: unknown;
}

/**
 * 工作流步骤定义
 */
export interface WorkflowStep {
  /** 步骤 ID */
  id: string;
  /** 步骤名称 */
  name: string;
  /** 步骤描述 */
  description: string;
  /** 关联的 Agent ID */
  agentId: PosterAgentId;
  /** 步骤状态 */
  status?: WorkflowStepStatus;
  /** 是否可选 */
  optional: boolean;
  /** 预估时间（秒） */
  estimatedDuration?: number;
  /** 前置步骤 ID 列表 */
  dependencies?: string[];
  /** 步骤提示语 */
  prompts?: WorkflowPrompt[];
  /** 输入字段 */
  inputFields?: InputField[];
}

/**
 * 工作流提示语
 */
export interface WorkflowPrompt {
  /** 提示语 ID */
  id: string;
  /** 提示语文本 */
  text: string;
  /** 提示语类型 */
  type: "question" | "suggestion" | "example";
}

/**
 * 工作流步骤状态
 */
export interface WorkflowStepState {
  /** 步骤 ID */
  stepId: string;
  /** 状态 */
  status: WorkflowStepStatus;
  /** 开始时间 */
  startedAt?: Date;
  /** 完成时间 */
  completedAt?: Date;
  /** 步骤结果 */
  result?: unknown;
  /** 错误信息 */
  error?: string;
}

/**
 * 建议尺寸
 */
export interface SuggestedDimension {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 名称 */
  name: string;
}

/**
 * 工作流模板
 */
export interface WorkflowTemplate {
  /** 工作流 ID */
  id: string;
  /** 工作流名称 */
  name: string;
  /** 工作流描述 */
  description: string;
  /** 工作流图标 */
  icon?: string;
  /** 工作流分类 */
  category: WorkflowCategory;
  /** 工作流步骤 */
  steps: WorkflowStep[];
  /** 默认配置 */
  defaultConfig?: WorkflowConfig;
  /** 默认上下文 */
  defaultContext?: Record<string, unknown>;
  /** 推荐场景 */
  recommendedScenes?: string[];
  /** 示例预览图 */
  previewImages?: string[];
  /** 建议尺寸 */
  suggestedDimensions?: SuggestedDimension[];
  /** 标签 */
  tags?: string[];
}

/**
 * 工作流分类
 */
export type WorkflowCategory =
  | "ecommerce"
  | "branding"
  | "social"
  | "event"
  | "education"
  | "custom";

/**
 * 工作流配置
 */
export interface WorkflowConfig {
  /** 自动执行模式 */
  autoExecute?: boolean;
  /** 跳过可选步骤 */
  skipOptionalSteps?: boolean;
  /** 默认样式偏好 */
  stylePreference?: string;
  /** 默认输出平台 */
  targetPlatforms?: string[];
}

/**
 * 工作流实例状态
 */
export interface WorkflowState {
  /** 工作流模板 ID */
  templateId: string;
  /** 当前步骤索引 */
  currentStepIndex: number;
  /** 各步骤状态 */
  stepStates: Map<string, WorkflowStepState>;
  /** 工作流配置 */
  config: WorkflowConfig;
  /** 开始时间 */
  startedAt?: Date;
  /** 完成时间 */
  completedAt?: Date;
  /** 是否暂停 */
  isPaused: boolean;
}

/**
 * 工作流事件
 */
export type WorkflowEvent =
  | { type: "START"; templateId: string; config?: WorkflowConfig }
  | { type: "STEP_START"; stepId: string }
  | { type: "STEP_COMPLETE"; stepId: string; result: unknown }
  | { type: "STEP_SKIP"; stepId: string }
  | { type: "STEP_ERROR"; stepId: string; error: string }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "COMPLETE" };

/**
 * 工作流回调函数
 */
export interface WorkflowCallbacks {
  /** 步骤开始回调 */
  onStepStart?: (step: WorkflowStep) => void;
  /** 步骤完成回调 */
  onStepComplete?: (step: WorkflowStep, result: unknown) => void;
  /** 步骤跳过回调 */
  onStepSkip?: (step: WorkflowStep) => void;
  /** 步骤错误回调 */
  onStepError?: (step: WorkflowStep, error: string) => void;
  /** 工作流完成回调 */
  onWorkflowComplete?: (results: Map<string, unknown>) => void;
  /** 进度更新回调 */
  onProgressUpdate?: (progress: number, currentStep: WorkflowStep) => void;
}

/**
 * 工作流上下文
 */
export interface WorkflowContext {
  /** 项目 ID */
  projectId?: string;
  /** 品牌人设 ID */
  brandPersonaId?: string;
  /** 用户输入 */
  userInput: string;
  /** 画布 JSON */
  canvasJson?: Record<string, unknown>;
  /** 选中的素材 */
  selectedMaterials?: string[];
  /** 目标平台 */
  targetPlatforms?: string[];
  /** 额外上下文 */
  extra?: Record<string, unknown>;
}
