/**
 * @file types.ts
 * @description Agent 系统类型定义
 * @module components/content-creator/agents/base/types
 */

import type { BrandPersona } from "@/types/brand-persona";
import type { Material } from "@/types/material";

// ============================================================================
// Agent 配置
// ============================================================================

/**
 * Agent 配置
 */
export interface AgentConfig {
  /** Agent ID */
  id: string;
  /** Agent 名称 */
  name: string;
  /** Agent 描述 */
  description: string;
  /** 使用的模型 */
  model?: string;
  /** 温度参数 */
  temperature?: number;
}

// ============================================================================
// Agent 输入输出
// ============================================================================

/**
 * Agent 输入
 */
export interface AgentInput {
  /** 用户输入 */
  userInput?: string;
  /** 上下文数据 */
  context: Record<string, unknown>;
  /** 品牌人设 */
  persona?: BrandPersona;
  /** 素材列表 */
  materials?: Material[];
}

/**
 * Agent 输出
 */
export interface AgentOutput {
  /** 摘要 */
  summary?: string;
  /** 建议列表 */
  suggestions: AgentSuggestion[];
  /** 元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * Agent 建议类型
 */
export type AgentSuggestionType =
  | "layout"
  | "element"
  | "style"
  | "text"
  | "choice";

/**
 * Agent 建议
 */
export interface AgentSuggestion {
  /** 建议 ID */
  id: string;
  /** 建议类型 */
  type: AgentSuggestionType;
  /** 建议标题 */
  title: string;
  /** 建议描述 */
  description?: string;
  /** 建议内容 */
  content: unknown;
  /** 建议原因 */
  reason: string;
  /** 置信度 (0-1) */
  confidence: number;
  /** 预览图 URL */
  preview?: string;
}

// ============================================================================
// 需求分析
// ============================================================================

/**
 * 需求分析结果
 */
export interface RequirementAnalysis {
  /** 设计目的 */
  purpose: string;
  /** 目标受众 */
  audience: {
    /** 目标人群 */
    demographic: string;
    /** 年龄范围 */
    ageRange: string;
    /** 兴趣点 */
    interests: string[];
  };
  /** 关键元素 */
  keyElements: {
    /** 主要文案 */
    primaryText: string;
    /** 次要文案 */
    secondaryText: string;
    /** 行动号召 */
    callToAction: string;
  };
  /** 视觉要求 */
  visualRequirements: {
    /** 推荐尺寸 */
    recommendedSize: { width: number; height: number };
    /** 色彩氛围 */
    colorMood: string;
    /** 风格建议 */
    style: string;
  };
  /** 约束条件 */
  constraints: string[];
}

// ============================================================================
// 风格推荐
// ============================================================================

/**
 * 风格推荐
 */
export interface StyleRecommendation {
  /** 风格 ID */
  id: string;
  /** 风格名称 */
  name: string;
  /** 风格描述 */
  description: string;
  /** 配色方案 */
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  /** 字体方案 */
  typography: {
    titleFont: string;
    bodyFont: string;
    titleSize: number;
    bodySize: number;
  };
  /** 氛围 */
  mood: string;
  /** 适用场景 */
  suitableFor: string[];
  /** 预览图 */
  preview?: string;
}

// ============================================================================
// 布局方案
// ============================================================================

/**
 * Fabric.js 对象
 */
export interface FabricObject {
  type: string;
  left: number;
  top: number;
  width?: number;
  height?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: string;
  rx?: number;
  ry?: number;
  src?: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * 布局方案
 */
export interface LayoutScheme {
  /** 布局 ID */
  id: string;
  /** 布局名称 */
  name: string;
  /** 布局描述 */
  description: string;
  /** 缩略图 */
  thumbnail?: string;
  /** Fabric.js JSON */
  fabricJson: {
    version: string;
    objects: FabricObject[];
  };
  /** 元数据 */
  metadata: {
    /** 图片占比 */
    imageRatio: number;
    /** 文字占比 */
    textRatio: number;
    /** 留白占比 */
    whiteSpace: number;
    /** 视觉层次 */
    hierarchy: string[];
  };
}

/**
 * 布局类型
 */
export type LayoutType =
  | "hero-image"
  | "text-dominant"
  | "grid"
  | "split"
  | "minimal"
  | "collage";

// ============================================================================
// 内容填充
// ============================================================================

/**
 * 内容填充结果
 */
export interface ContentFillResult {
  /** 元素列表 */
  elements: FabricObject[];
  /** 文字内容 */
  textContent: {
    title: string;
    subtitle: string;
    body?: string;
    callToAction?: string;
  };
  /** 图片推荐 */
  imageRecommendations: {
    type: string;
    description: string;
    suggestedMaterials: Material[];
  }[];
}

// ============================================================================
// 优化建议
// ============================================================================

/**
 * 优化建议分类
 */
export type RefineSuggestionCategory =
  | "layout"
  | "typography"
  | "color"
  | "alignment"
  | "hierarchy";

/**
 * 优化建议严重程度
 */
export type RefineSuggestionSeverity = "info" | "warning" | "suggestion";

/**
 * 优化建议
 */
export interface RefineSuggestion {
  /** 分类 */
  category: RefineSuggestionCategory;
  /** 严重程度 */
  severity: RefineSuggestionSeverity;
  /** 描述 */
  description: string;
  /** 原因 */
  reason: string;
  /** 操作 */
  action: {
    type: "adjust" | "replace" | "add" | "remove";
    target: string;
    property?: string;
    value?: unknown;
  };
  /** 前后对比预览 */
  beforeAfterPreview?: {
    before: string;
    after: string;
  };
}

// ============================================================================
// 导出优化
// ============================================================================

/**
 * 导出优化结果
 */
export interface ExportOptimization {
  /** 目标平台 */
  platform: string;
  /** 尺寸 */
  size: { width: number; height: number };
  /** 格式 */
  format: "png" | "jpg";
  /** 质量 */
  quality: number;
  /** 调整项 */
  adjustments: {
    type: string;
    description: string;
    applied: boolean;
  }[];
}

// ============================================================================
// Agent 调度
// ============================================================================

/**
 * Agent 进度回调
 */
export type AgentProgressCallback = (
  agentId: string,
  progress: number,
  result?: AgentOutput,
) => void;

/**
 * 海报 Agent ID
 */
export type PosterAgentId =
  | "requirement"
  | "style"
  | "layout"
  | "content"
  | "refine"
  | "export";
