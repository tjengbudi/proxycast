/**
 * 品牌人设相关类型定义
 *
 * 定义品牌人设（BrandPersona）相关的 TypeScript 类型，
 * 用于海报设计系统的品牌视觉规范管理。
 *
 * @module types/brand-persona
 */

import type { Persona } from "./persona";

// ============================================================================
// 品牌个性类型
// ============================================================================

/**
 * 品牌个性类型
 */
export type BrandPersonality =
  | "professional" // 专业严谨
  | "friendly" // 亲切友好
  | "playful" // 活泼有趣
  | "luxurious" // 奢华高端
  | "minimalist" // 简约克制
  | "bold" // 大胆张扬
  | "elegant"; // 优雅精致

/**
 * 品牌个性显示名称映射
 */
export const BRAND_PERSONALITY_NAMES: Record<BrandPersonality, string> = {
  professional: "专业严谨",
  friendly: "亲切友好",
  playful: "活泼有趣",
  luxurious: "奢华高端",
  minimalist: "简约克制",
  bold: "大胆张扬",
  elegant: "优雅精致",
};

/**
 * 品牌个性描述映射
 */
export const BRAND_PERSONALITY_DESCRIPTIONS: Record<BrandPersonality, string> =
  {
    professional: "传递专业可信的形象",
    friendly: "拉近与用户的距离",
    playful: "充满活力和趣味",
    luxurious: "彰显品质和档次",
    minimalist: "少即是多的美学",
    bold: "敢于突破和创新",
    elegant: "精致细腻的品味",
  };

// ============================================================================
// 设计风格类型
// ============================================================================

/**
 * 设计风格类型
 */
export type DesignStyle =
  | "minimal" // 极简
  | "modern" // 现代
  | "classic" // 经典
  | "playful" // 活泼
  | "corporate" // 商务
  | "artistic" // 艺术
  | "retro"; // 复古

/**
 * 设计风格显示名称映射
 */
export const DESIGN_STYLE_NAMES: Record<DesignStyle, string> = {
  minimal: "极简",
  modern: "现代",
  classic: "经典",
  playful: "活泼",
  corporate: "商务",
  artistic: "艺术",
  retro: "复古",
};

// ============================================================================
// 配色方案
// ============================================================================

/**
 * 渐变配置
 */
export interface GradientConfig {
  /** 渐变名称 */
  name: string;
  /** 渐变颜色列表 */
  colors: string[];
  /** 渐变方向（角度） */
  direction: number;
}

/**
 * 配色方案
 */
export interface ColorScheme {
  /** 主色 */
  primary: string;
  /** 辅色 */
  secondary: string;
  /** 强调色 */
  accent: string;
  /** 背景色 */
  background: string;
  /** 文字色 */
  text: string;
  /** 次要文字色 */
  textSecondary: string;
  /** 渐变配置 */
  gradients?: GradientConfig[];
}

/**
 * 预设配色方案
 */
export const PRESET_COLOR_SCHEMES: { name: string; colors: ColorScheme }[] = [
  {
    name: "清新粉",
    colors: {
      primary: "#FF6B9D",
      secondary: "#FFC0D0",
      accent: "#FF4081",
      background: "#FFFFFF",
      text: "#333333",
      textSecondary: "#666666",
    },
  },
  {
    name: "商务蓝",
    colors: {
      primary: "#2196F3",
      secondary: "#90CAF9",
      accent: "#1976D2",
      background: "#FFFFFF",
      text: "#212121",
      textSecondary: "#757575",
    },
  },
  {
    name: "奢华金",
    colors: {
      primary: "#D4AF37",
      secondary: "#C9A86C",
      accent: "#FFD700",
      background: "#0A0A0A",
      text: "#FFFFFF",
      textSecondary: "#B0B0B0",
    },
  },
  {
    name: "自然绿",
    colors: {
      primary: "#4CAF50",
      secondary: "#A5D6A7",
      accent: "#2E7D32",
      background: "#FFFFFF",
      text: "#1B5E20",
      textSecondary: "#558B2F",
    },
  },
  {
    name: "活力橙",
    colors: {
      primary: "#FF9500",
      secondary: "#FFD166",
      accent: "#EF476F",
      background: "#FFFFFF",
      text: "#2D3436",
      textSecondary: "#636E72",
    },
  },
  {
    name: "电商红",
    colors: {
      primary: "#FF4757",
      secondary: "#FFA502",
      accent: "#FF6348",
      background: "#FFFFFF",
      text: "#2F3542",
      textSecondary: "#57606F",
    },
  },
];

// ============================================================================
// 字体方案
// ============================================================================

/**
 * 字体方案
 */
export interface Typography {
  /** 标题字体 */
  titleFont: string;
  /** 标题字重 */
  titleWeight: number;
  /** 正文字体 */
  bodyFont: string;
  /** 正文字重 */
  bodyWeight: number;
  /** 标题字号基准 */
  titleSize: number;
  /** 正文字号基准 */
  bodySize: number;
  /** 行高 */
  lineHeight: number;
  /** 字间距 */
  letterSpacing: number;
}

/**
 * 可用字体列表
 */
export const AVAILABLE_FONTS = [
  { id: "source-han-sans", name: "思源黑体" },
  { id: "source-han-serif", name: "思源宋体" },
  { id: "pingfang", name: "苹方" },
  { id: "alibaba-puhuiti", name: "阿里巴巴普惠体" },
  { id: "zcool-kuaile", name: "站酷快乐体" },
  { id: "zcool-qingke", name: "站酷庆科黄油体" },
];

/**
 * 默认字体方案
 */
export const DEFAULT_TYPOGRAPHY: Typography = {
  titleFont: "思源黑体",
  titleWeight: 700,
  bodyFont: "苹方",
  bodyWeight: 400,
  titleSize: 72,
  bodySize: 24,
  lineHeight: 1.5,
  letterSpacing: 0,
};

// ============================================================================
// 视觉规范
// ============================================================================

/**
 * Logo 位置类型
 */
export type LogoPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

/**
 * Logo 位置配置
 */
export interface LogoPlacement {
  /** 默认位置 */
  defaultPosition: LogoPosition;
  /** 内边距 */
  padding: number;
  /** 最大尺寸（百分比） */
  maxSize: number;
}

/**
 * 图片风格配置
 */
export interface ImageStyle {
  /** CSS 滤镜 */
  filter?: string;
  /** 圆角 */
  borderRadius: number;
  /** 阴影 */
  shadow?: string;
  /** 偏好比例 */
  preferredRatio: string;
}

/**
 * 图标风格类型
 */
export type IconStyleType = "filled" | "outlined" | "rounded";

/**
 * 图标风格配置
 */
export interface IconStyle {
  /** 风格类型 */
  style: IconStyleType;
  /** 描边宽度 */
  strokeWidth?: number;
  /** 默认颜色 */
  defaultColor: string;
}

/**
 * 视觉规范配置
 */
export interface VisualConfig {
  /** Logo 图片 URL */
  logoUrl?: string;
  /** Logo 位置配置 */
  logoPlacement: LogoPlacement;
  /** 图片风格 */
  imageStyle: ImageStyle;
  /** 图标风格 */
  iconStyle: IconStyle;
  /** 装饰元素列表 */
  decorations: string[];
}

// ============================================================================
// 品牌调性
// ============================================================================

/**
 * 品牌调性配置
 */
export interface BrandTone {
  /** 品牌关键词 */
  keywords: string[];
  /** 品牌个性 */
  personality: BrandPersonality;
  /** 品牌语调 */
  voiceTone?: string;
  /** 目标受众描述 */
  targetAudience?: string;
}

// ============================================================================
// 设计配置
// ============================================================================

/**
 * 设计配置
 */
export interface DesignConfig {
  /** 主风格 */
  primaryStyle: DesignStyle;
  /** 配色方案 */
  colorScheme: ColorScheme;
  /** 字体方案 */
  typography: Typography;
}

// ============================================================================
// 品牌人设扩展
// ============================================================================

/**
 * 品牌人设扩展
 */
export interface BrandPersonaExtension {
  /** 关联的人设 ID */
  personaId: string;
  /** 品牌调性 */
  brandTone: BrandTone;
  /** 设计配置 */
  design: DesignConfig;
  /** 视觉规范 */
  visual: VisualConfig;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/**
 * 品牌人设（完整视图）
 */
export interface BrandPersona extends Persona {
  /** 品牌调性 */
  brandTone?: BrandTone;
  /** 设计配置 */
  design?: DesignConfig;
  /** 视觉规范 */
  visual?: VisualConfig;
}

// ============================================================================
// 请求类型
// ============================================================================

/**
 * 创建品牌人设扩展请求
 */
export interface CreateBrandExtensionRequest {
  /** 关联的人设 ID */
  personaId: string;
  /** 品牌调性 */
  brandTone?: BrandTone;
  /** 设计配置 */
  design?: DesignConfig;
  /** 视觉规范 */
  visual?: VisualConfig;
}

/**
 * 更新品牌人设扩展请求
 */
export interface UpdateBrandExtensionRequest {
  /** 品牌调性 */
  brandTone?: BrandTone;
  /** 设计配置 */
  design?: DesignConfig;
  /** 视觉规范 */
  visual?: VisualConfig;
}

// ============================================================================
// 品牌人设模板
// ============================================================================

/**
 * 品牌人设模板
 */
export interface BrandPersonaTemplate {
  /** 模板 ID */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 品牌调性 */
  brandTone: BrandTone;
  /** 设计配置 */
  design: DesignConfig;
  /** 视觉规范 */
  visual?: VisualConfig;
}

// ============================================================================
// 默认值
// ============================================================================

/**
 * 默认配色方案
 */
export const DEFAULT_COLOR_SCHEME: ColorScheme = {
  primary: "#2196F3",
  secondary: "#90CAF9",
  accent: "#1976D2",
  background: "#FFFFFF",
  text: "#212121",
  textSecondary: "#757575",
};

/**
 * 默认 Logo 位置配置
 */
export const DEFAULT_LOGO_PLACEMENT: LogoPlacement = {
  defaultPosition: "top-left",
  padding: 20,
  maxSize: 15,
};

/**
 * 默认图片风格
 */
export const DEFAULT_IMAGE_STYLE: ImageStyle = {
  borderRadius: 8,
  preferredRatio: "3:4",
};

/**
 * 默认图标风格
 */
export const DEFAULT_ICON_STYLE: IconStyle = {
  style: "outlined",
  strokeWidth: 2,
  defaultColor: "#333333",
};

/**
 * 默认视觉配置
 */
export const DEFAULT_VISUAL_CONFIG: VisualConfig = {
  logoPlacement: DEFAULT_LOGO_PLACEMENT,
  imageStyle: DEFAULT_IMAGE_STYLE,
  iconStyle: DEFAULT_ICON_STYLE,
  decorations: [],
};

/**
 * 默认品牌调性
 */
export const DEFAULT_BRAND_TONE: BrandTone = {
  keywords: [],
  personality: "professional",
};

/**
 * 默认设计配置
 */
export const DEFAULT_DESIGN_CONFIG: DesignConfig = {
  primaryStyle: "modern",
  colorScheme: DEFAULT_COLOR_SCHEME,
  typography: DEFAULT_TYPOGRAPHY,
};
