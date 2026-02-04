/**
 * @file index.ts
 * @description 平台规范模块导出
 * @module components/content-creator/canvas/poster/platforms
 */

// 类型导出
export type {
  PlatformId,
  SizeSpec,
  SafeZone,
  FileSpec,
  TextSpec,
  PlatformSpec,
  ExportConfig,
  BatchExportConfig,
  ExportResult,
} from "./types";

// 平台规范导出
export { xiaohongshuSpec } from "./xiaohongshu";
export { wechatSpec } from "./wechat";
export { taobaoSpec } from "./taobao";
export { douyinSpec } from "./douyin";

import { xiaohongshuSpec } from "./xiaohongshu";
import { wechatSpec } from "./wechat";
import { taobaoSpec } from "./taobao";
import { douyinSpec } from "./douyin";
import type { PlatformSpec, PlatformId } from "./types";

/**
 * 所有平台规范
 */
export const allPlatformSpecs: PlatformSpec[] = [
  xiaohongshuSpec,
  wechatSpec,
  taobaoSpec,
  douyinSpec,
];

/**
 * 平台规范注册表
 */
export const platformSpecRegistry: Record<PlatformId, PlatformSpec> = {
  xiaohongshu: xiaohongshuSpec,
  wechat: wechatSpec,
  taobao: taobaoSpec,
  douyin: douyinSpec,
} as Record<PlatformId, PlatformSpec>;

/**
 * 获取平台规范
 *
 * @param id - 平台 ID
 * @returns 平台规范
 */
export function getPlatformSpec(id: PlatformId): PlatformSpec | undefined {
  return platformSpecRegistry[id];
}

/**
 * 获取平台推荐尺寸
 *
 * @param id - 平台 ID
 * @returns 推荐尺寸
 */
export function getRecommendedSize(id: PlatformId) {
  const spec = getPlatformSpec(id);
  if (!spec) return null;
  return spec.sizes.find((s) => s.recommended) || spec.sizes[0];
}

/**
 * 检查文件是否符合平台规范
 *
 * @param id - 平台 ID
 * @param fileSize - 文件大小 (KB)
 * @param format - 文件格式
 * @returns 是否符合规范
 */
export function checkFileCompliance(
  id: PlatformId,
  fileSize: number,
  format: string,
): { valid: boolean; errors: string[] } {
  const spec = getPlatformSpec(id);
  if (!spec) return { valid: false, errors: ["未知平台"] };

  const errors: string[] = [];

  if (fileSize > spec.fileSpec.maxSizeKB) {
    errors.push(`文件大小超出限制 (最大 ${spec.fileSpec.maxSizeKB / 1024}MB)`);
  }

  if (!spec.fileSpec.formats.includes(format.toLowerCase())) {
    errors.push(`不支持的文件格式 (支持: ${spec.fileSpec.formats.join(", ")})`);
  }

  return { valid: errors.length === 0, errors };
}
