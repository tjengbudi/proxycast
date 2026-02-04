/**
 * @file types.ts
 * @description 平台规范类型定义
 * @module components/content-creator/canvas/poster/platforms/types
 */

/**
 * 平台 ID
 */
export type PlatformId =
  | "xiaohongshu"
  | "wechat"
  | "weibo"
  | "taobao"
  | "jd"
  | "pinduoduo"
  | "douyin"
  | "bilibili"
  | "instagram"
  | "custom";

/**
 * 尺寸规格
 */
export interface SizeSpec {
  /** 规格名称 */
  name: string;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 宽高比 */
  aspectRatio: string;
  /** 用途说明 */
  usage: string;
  /** 是否推荐 */
  recommended?: boolean;
}

/**
 * 安全区域
 */
export interface SafeZone {
  /** 顶部安全距离 */
  top: number;
  /** 底部安全距离 */
  bottom: number;
  /** 左侧安全距离 */
  left: number;
  /** 右侧安全距离 */
  right: number;
  /** 说明 */
  description?: string;
}

/**
 * 文件规格
 */
export interface FileSpec {
  /** 支持的格式 */
  formats: string[];
  /** 最大文件大小 (KB) */
  maxSizeKB: number;
  /** 推荐 DPI */
  recommendedDPI?: number;
  /** 色彩模式 */
  colorMode: "RGB" | "CMYK" | "both";
}

/**
 * 文字规范
 */
export interface TextSpec {
  /** 最小字号 */
  minFontSize: number;
  /** 推荐标题字号 */
  recommendedTitleSize: number;
  /** 推荐正文字号 */
  recommendedBodySize: number;
  /** 行高建议 */
  lineHeightRatio: number;
}

/**
 * 平台规范
 */
export interface PlatformSpec {
  /** 平台 ID */
  id: PlatformId;
  /** 平台名称 */
  name: string;
  /** 平台图标 */
  icon?: string;
  /** 平台描述 */
  description: string;
  /** 尺寸规格列表 */
  sizes: SizeSpec[];
  /** 安全区域 */
  safeZone?: SafeZone;
  /** 文件规格 */
  fileSpec: FileSpec;
  /** 文字规范 */
  textSpec?: TextSpec;
  /** 特殊注意事项 */
  notes?: string[];
  /** 平台链接 */
  guideUrl?: string;
}

/**
 * 导出配置
 */
export interface ExportConfig {
  /** 目标平台 */
  platform: PlatformId;
  /** 选择的尺寸规格 */
  sizeSpec: SizeSpec;
  /** 文件格式 */
  format: string;
  /** 图片质量 (0-100) */
  quality: number;
  /** 是否显示安全区域 */
  showSafeZone?: boolean;
  /** 自定义文件名 */
  filename?: string;
}

/**
 * 批量导出配置
 */
export interface BatchExportConfig {
  /** 导出配置列表 */
  configs: ExportConfig[];
  /** 输出目录 */
  outputDir?: string;
  /** 文件名前缀 */
  filenamePrefix?: string;
  /** 是否压缩打包 */
  compress?: boolean;
}

/**
 * 导出结果
 */
export interface ExportResult {
  /** 是否成功 */
  success: boolean;
  /** 文件路径 */
  filePath?: string;
  /** 文件大小 (bytes) */
  fileSize?: number;
  /** 错误信息 */
  error?: string;
  /** 平台 ID */
  platform: PlatformId;
  /** 尺寸规格名称 */
  sizeName: string;
}
