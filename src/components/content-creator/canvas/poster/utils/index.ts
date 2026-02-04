/**
 * @file 工具函数模块导出
 * @description 导出海报画布相关的工具函数
 * @module components/content-creator/canvas/poster/utils
 */

export { layerUtils } from "./layerUtils";
export {
  alignmentUtils,
  DEFAULT_ALIGNMENT_CONFIG,
  ALIGN_BUTTONS,
  type AlignmentLine,
  type AlignmentLineType,
  type AlignmentSource,
  type AlignmentResult,
  type ElementBounds,
  type AlignmentConfig,
  type AlignDirection,
  type AlignButtonConfig,
} from "./alignmentGuides";
export {
  styleUtils,
  type TextStyle,
  type ShapeStyle,
  type ImageStyle,
  type ImageFilter,
} from "./styleUtils";

// 安全区域工具
export {
  createSafeZoneOverlay,
  checkSafeZone,
  showPlatformSafeZone,
  hideSafeZone,
} from "./safeZone";
export type {
  SafeZoneDisplayOptions,
  SafeZoneCheckResult,
  SafeZoneViolation,
} from "./safeZone";

// 智能裁切工具
export {
  calculateSmartCrop,
  applyCropToCanvas,
  previewCrop,
} from "./smartCrop";
export type {
  CropRegion,
  SmartCropOptions,
  SmartCropResult,
} from "./smartCrop";
