/**
 * @file smartCrop.ts
 * @description 智能裁切工具
 * @module components/content-creator/canvas/poster/utils/smartCrop
 */

import type { SizeSpec, SafeZone } from "../platforms/types";
import type { fabric } from "fabric";

/**
 * 裁切区域
 */
export interface CropRegion {
  /** 左上角 X */
  x: number;
  /** 左上角 Y */
  y: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/**
 * 裁切选项
 */
export interface SmartCropOptions {
  /** 源尺寸 */
  sourceWidth: number;
  sourceHeight: number;
  /** 目标尺寸 */
  targetSpec: SizeSpec;
  /** 安全区域 */
  safeZone?: SafeZone;
  /** 焦点位置 (0-1) */
  focusPoint?: { x: number; y: number };
  /** 裁切策略 */
  strategy?: "center" | "focus" | "smart";
}

/**
 * 裁切结果
 */
export interface SmartCropResult {
  /** 裁切区域 */
  cropRegion: CropRegion;
  /** 缩放比例 */
  scale: number;
  /** 是否需要裁切 */
  needsCrop: boolean;
  /** 安全区域警告 */
  safeZoneWarnings: string[];
}

/**
 * 计算智能裁切区域
 *
 * @param options - 裁切选项
 * @returns 裁切结果
 */
export function calculateSmartCrop(options: SmartCropOptions): SmartCropResult {
  const {
    sourceWidth,
    sourceHeight,
    targetSpec,
    safeZone,
    focusPoint = { x: 0.5, y: 0.5 },
    strategy = "center",
  } = options;

  const targetWidth = targetSpec.width;
  const targetHeight = targetSpec.height;

  // 计算宽高比
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;

  let cropRegion: CropRegion;
  let scale: number;
  let needsCrop = false;

  if (Math.abs(sourceRatio - targetRatio) < 0.01) {
    // 宽高比相同，直接缩放
    scale = targetWidth / sourceWidth;
    cropRegion = {
      x: 0,
      y: 0,
      width: sourceWidth,
      height: sourceHeight,
    };
  } else if (sourceRatio > targetRatio) {
    // 源图更宽，需要裁切左右
    needsCrop = true;
    const newWidth = sourceHeight * targetRatio;
    scale = targetWidth / newWidth;

    let x: number;
    if (strategy === "center") {
      x = (sourceWidth - newWidth) / 2;
    } else if (strategy === "focus") {
      x = Math.max(
        0,
        Math.min(
          sourceWidth - newWidth,
          focusPoint.x * sourceWidth - newWidth / 2,
        ),
      );
    } else {
      // smart: 默认居中
      x = (sourceWidth - newWidth) / 2;
    }

    cropRegion = {
      x,
      y: 0,
      width: newWidth,
      height: sourceHeight,
    };
  } else {
    // 源图更高，需要裁切上下
    needsCrop = true;
    const newHeight = sourceWidth / targetRatio;
    scale = targetHeight / newHeight;

    let y: number;
    if (strategy === "center") {
      y = (sourceHeight - newHeight) / 2;
    } else if (strategy === "focus") {
      y = Math.max(
        0,
        Math.min(
          sourceHeight - newHeight,
          focusPoint.y * sourceHeight - newHeight / 2,
        ),
      );
    } else {
      // smart: 偏上裁切（人物通常在上半部分）
      y = (sourceHeight - newHeight) / 3;
    }

    cropRegion = {
      x: 0,
      y,
      width: sourceWidth,
      height: newHeight,
    };
  }

  // 检查安全区域
  const safeZoneWarnings: string[] = [];
  if (safeZone && needsCrop) {
    const scaledSafeZone = {
      top: safeZone.top / scale,
      bottom: safeZone.bottom / scale,
      left: safeZone.left / scale,
      right: safeZone.right / scale,
    };

    if (cropRegion.x > scaledSafeZone.left) {
      safeZoneWarnings.push("左侧内容可能被裁切");
    }
    if (sourceWidth - cropRegion.x - cropRegion.width > scaledSafeZone.right) {
      safeZoneWarnings.push("右侧内容可能被裁切");
    }
    if (cropRegion.y > scaledSafeZone.top) {
      safeZoneWarnings.push("顶部内容可能被裁切");
    }
    if (
      sourceHeight - cropRegion.y - cropRegion.height >
      scaledSafeZone.bottom
    ) {
      safeZoneWarnings.push("底部内容可能被裁切");
    }
  }

  return {
    cropRegion,
    scale,
    needsCrop,
    safeZoneWarnings,
  };
}

/**
 * 应用裁切到画布
 *
 * @param canvas - Fabric.js 画布
 * @param cropResult - 裁切结果
 * @param targetSpec - 目标尺寸
 */
export function applyCropToCanvas(
  canvas: fabric.Canvas,
  cropResult: SmartCropResult,
  targetSpec: SizeSpec,
): void {
  const { cropRegion, scale } = cropResult;

  // 设置画布视口
  canvas.setViewportTransform([
    scale,
    0,
    0,
    scale,
    -cropRegion.x * scale,
    -cropRegion.y * scale,
  ]);

  // 更新画布尺寸
  canvas.setWidth(targetSpec.width);
  canvas.setHeight(targetSpec.height);
  canvas.renderAll();
}

/**
 * 预览裁切效果
 *
 * @param sourceDataUrl - 源图片 DataURL
 * @param cropResult - 裁切结果
 * @param targetSpec - 目标尺寸
 * @returns 预览图片 DataURL
 */
export async function previewCrop(
  sourceDataUrl: string,
  cropResult: SmartCropResult,
  targetSpec: SizeSpec,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetSpec.width;
      canvas.height = targetSpec.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("无法创建 canvas context"));
        return;
      }

      const { cropRegion, scale: _scale } = cropResult;

      ctx.drawImage(
        img,
        cropRegion.x,
        cropRegion.y,
        cropRegion.width,
        cropRegion.height,
        0,
        0,
        targetSpec.width,
        targetSpec.height,
      );

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = sourceDataUrl;
  });
}

export default {
  calculateSmartCrop,
  applyCropToCanvas,
  previewCrop,
};
