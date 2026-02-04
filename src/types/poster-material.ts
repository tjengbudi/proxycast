/**
 * 海报素材相关类型定义
 *
 * 定义海报素材（PosterMaterial）相关的 TypeScript 类型，
 * 用于海报设计系统的素材管理。
 *
 * @module types/poster-material
 */

import type { Material } from "./material";

// ============================================================================
// 图片分类
// ============================================================================

/**
 * 图片分类类型
 */
export type ImageCategory =
  | "background" // 背景图
  | "product" // 产品图
  | "person" // 人物图
  | "decoration" // 装饰图
  | "texture" // 纹理图
  | "other"; // 其他

/**
 * 图片分类显示名称映射
 */
export const IMAGE_CATEGORY_NAMES: Record<ImageCategory, string> = {
  background: "背景",
  product: "产品",
  person: "人物",
  decoration: "装饰",
  texture: "纹理",
  other: "其他",
};

/**
 * 图片分类图标映射
 */
export const IMAGE_CATEGORY_ICONS: Record<ImageCategory, string> = {
  background: "🖼️",
  product: "📦",
  person: "👤",
  decoration: "✨",
  texture: "🎨",
  other: "📁",
};

// ============================================================================
// 布局分类
// ============================================================================

/**
 * 布局分类类型
 */
export type LayoutCategory =
  | "hero-image" // 大图型
  | "text-dominant" // 文字主导
  | "grid" // 网格型
  | "split" // 分割型
  | "minimal" // 极简型
  | "collage"; // 拼贴型

/**
 * 布局分类显示名称映射
 */
export const LAYOUT_CATEGORY_NAMES: Record<LayoutCategory, string> = {
  "hero-image": "大图型",
  "text-dominant": "文字型",
  grid: "网格型",
  split: "分割型",
  minimal: "极简型",
  collage: "拼贴型",
};

// ============================================================================
// 图标风格
// ============================================================================

/**
 * 图标风格类型（海报素材专用）
 * 注意：与 brand-persona.ts 中的 IconStyleType 相同，但为避免循环依赖单独定义
 */
export type PosterIconStyleType = "filled" | "outlined" | "rounded";

/**
 * 图标分类
 */
export type IconCategory =
  | "social" // 社交
  | "action" // 操作
  | "commerce" // 电商
  | "arrow" // 箭头
  | "emoji" // 表情
  | "other"; // 其他

/**
 * 图标分类显示名称映射
 */
export const ICON_CATEGORY_NAMES: Record<IconCategory, string> = {
  social: "社交",
  action: "操作",
  commerce: "电商",
  arrow: "箭头",
  emoji: "表情",
  other: "其他",
};

// ============================================================================
// 配色氛围
// ============================================================================

/**
 * 配色氛围类型
 */
export type ColorMood =
  | "warm" // 温暖
  | "cool" // 清凉
  | "fresh" // 清新
  | "luxury" // 高级
  | "vibrant" // 活力
  | "neutral"; // 中性

/**
 * 配色氛围显示名称映射
 */
export const COLOR_MOOD_NAMES: Record<ColorMood, string> = {
  warm: "温暖",
  cool: "清凉",
  fresh: "清新",
  luxury: "高级",
  vibrant: "活力",
  neutral: "中性",
};

// ============================================================================
// 海报素材元数据
// ============================================================================

/**
 * 海报素材元数据
 */
export interface PosterMaterialMetadata {
  /** 关联的素材 ID */
  materialId: string;
  /** 图片分类（仅 image 类型） */
  imageCategory?: ImageCategory;
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
  /** 缩略图路径或 base64 */
  thumbnail?: string;
  /** 主色列表 */
  colors: string[];
  /** 图标风格（仅 icon 类型） */
  iconStyle?: PosterIconStyleType;
  /** 图标分类（仅 icon 类型） */
  iconCategory?: IconCategory;
  /** 配色方案数据（仅 color 类型，JSON） */
  colorSchemeJson?: string;
  /** 配色氛围（仅 color 类型） */
  mood?: ColorMood;
  /** 布局分类（仅 layout 类型） */
  layoutCategory?: LayoutCategory;
  /** 布局元素数量（仅 layout 类型） */
  elementCount?: number;
  /** 布局预览图 */
  preview?: string;
  /** Fabric.js JSON（仅 layout 类型） */
  fabricJson?: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/**
 * 海报素材（完整视图）
 */
export interface PosterMaterial extends Material {
  /** 海报元数据 */
  metadata?: PosterMaterialMetadata;
}

// ============================================================================
// 请求类型
// ============================================================================

/**
 * 创建海报素材元数据请求
 */
export interface CreatePosterMetadataRequest {
  /** 关联的素材 ID */
  materialId: string;
  /** 图片分类 */
  imageCategory?: ImageCategory;
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
  /** 缩略图 */
  thumbnail?: string;
  /** 主色列表 */
  colors?: string[];
  /** 图标风格 */
  iconStyle?: PosterIconStyleType;
  /** 图标分类 */
  iconCategory?: IconCategory;
  /** 配色方案 JSON */
  colorSchemeJson?: string;
  /** 配色氛围 */
  mood?: ColorMood;
  /** 布局分类 */
  layoutCategory?: LayoutCategory;
  /** 布局元素数量 */
  elementCount?: number;
  /** 布局预览图 */
  preview?: string;
  /** Fabric.js JSON */
  fabricJson?: string;
}

// ============================================================================
// 素材筛选
// ============================================================================

/**
 * 海报素材筛选条件
 */
export interface PosterMaterialFilter {
  /** 素材类型 */
  type?: "image" | "icon" | "color" | "layout";
  /** 图片分类 */
  imageCategory?: ImageCategory;
  /** 图标分类 */
  iconCategory?: IconCategory;
  /** 配色氛围 */
  mood?: ColorMood;
  /** 布局分类 */
  layoutCategory?: LayoutCategory;
  /** 搜索关键词 */
  query?: string;
  /** 标签 */
  tags?: string[];
}

// ============================================================================
// 图片素材
// ============================================================================

/**
 * 图片素材（便捷类型）
 */
export interface ImageMaterial extends PosterMaterial {
  type: "image";
  metadata: PosterMaterialMetadata & {
    imageCategory: ImageCategory;
    width: number;
    height: number;
  };
}

/**
 * 图标素材（便捷类型）
 */
export interface IconMaterial extends PosterMaterial {
  type: "icon";
  metadata: PosterMaterialMetadata & {
    iconStyle: PosterIconStyleType;
    iconCategory: IconCategory;
  };
}

/**
 * 配色素材（便捷类型）
 */
export interface ColorMaterial extends PosterMaterial {
  type: "color";
  metadata: PosterMaterialMetadata & {
    colorSchemeJson: string;
    mood: ColorMood;
  };
}

/**
 * 布局素材（便捷类型）
 */
export interface LayoutMaterial extends PosterMaterial {
  type: "layout";
  metadata: PosterMaterialMetadata & {
    layoutCategory: LayoutCategory;
    elementCount: number;
    fabricJson: string;
  };
}

// ============================================================================
// 默认值
// ============================================================================

/**
 * 默认图片分类
 */
export const DEFAULT_IMAGE_CATEGORY: ImageCategory = "other";

/**
 * 默认布局分类
 */
export const DEFAULT_LAYOUT_CATEGORY: LayoutCategory = "hero-image";

/**
 * 默认图标风格
 */
export const DEFAULT_POSTER_ICON_STYLE: PosterIconStyleType = "outlined";

/**
 * 默认配色氛围
 */
export const DEFAULT_COLOR_MOOD: ColorMood = "neutral";
