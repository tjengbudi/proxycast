/**
 * @file safeZone.ts
 * @description 安全区域工具
 * @module components/content-creator/canvas/poster/utils/safeZone
 */

import { fabric } from "fabric";
import type { SafeZone, PlatformId } from "../platforms/types";
import { getPlatformSpec } from "../platforms";

/**
 * 安全区域显示选项
 */
export interface SafeZoneDisplayOptions {
  /** 边框颜色 */
  strokeColor?: string;
  /** 边框宽度 */
  strokeWidth?: number;
  /** 填充颜色 */
  fillColor?: string;
  /** 填充透明度 */
  fillOpacity?: number;
  /** 是否显示标签 */
  showLabels?: boolean;
  /** 标签字体大小 */
  labelFontSize?: number;
}

/**
 * 安全区域检查结果
 */
export interface SafeZoneCheckResult {
  /** 是否在安全区域内 */
  isInSafeZone: boolean;
  /** 违规元素列表 */
  violations: SafeZoneViolation[];
}

/**
 * 安全区域违规
 */
export interface SafeZoneViolation {
  /** 元素名称 */
  elementName: string;
  /** 元素类型 */
  elementType: string;
  /** 违规区域 */
  violatedZone: "top" | "bottom" | "left" | "right";
  /** 超出距离 */
  overflowAmount: number;
}

/**
 * 创建安全区域遮罩
 *
 * @param canvas - Fabric.js 画布
 * @param safeZone - 安全区域配置
 * @param options - 显示选项
 * @returns 安全区域对象组
 */
export function createSafeZoneOverlay(
  canvas: fabric.Canvas,
  safeZone: SafeZone,
  options: SafeZoneDisplayOptions = {},
): fabric.Group {
  const {
    strokeColor = "#ff6b6b",
    strokeWidth = 2,
    fillColor = "#ff6b6b",
    fillOpacity = 0.1,
    showLabels = true,
    labelFontSize = 12,
  } = options;

  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const objects: fabric.Object[] = [];

  // 顶部危险区域
  if (safeZone.top > 0) {
    const topRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: safeZone.top,
      fill: fillColor,
      opacity: fillOpacity,
      selectable: false,
      evented: false,
    });
    objects.push(topRect);

    if (showLabels) {
      const topLabel = new fabric.Text("顶部危险区", {
        left: canvasWidth / 2,
        top: safeZone.top / 2,
        fontSize: labelFontSize,
        fill: strokeColor,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
      });
      objects.push(topLabel);
    }
  }

  // 底部危险区域
  if (safeZone.bottom > 0) {
    const bottomRect = new fabric.Rect({
      left: 0,
      top: canvasHeight - safeZone.bottom,
      width: canvasWidth,
      height: safeZone.bottom,
      fill: fillColor,
      opacity: fillOpacity,
      selectable: false,
      evented: false,
    });
    objects.push(bottomRect);

    if (showLabels) {
      const bottomLabel = new fabric.Text("底部危险区", {
        left: canvasWidth / 2,
        top: canvasHeight - safeZone.bottom / 2,
        fontSize: labelFontSize,
        fill: strokeColor,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
      });
      objects.push(bottomLabel);
    }
  }

  // 左侧危险区域
  if (safeZone.left > 0) {
    const leftRect = new fabric.Rect({
      left: 0,
      top: safeZone.top,
      width: safeZone.left,
      height: canvasHeight - safeZone.top - safeZone.bottom,
      fill: fillColor,
      opacity: fillOpacity,
      selectable: false,
      evented: false,
    });
    objects.push(leftRect);
  }

  // 右侧危险区域
  if (safeZone.right > 0) {
    const rightRect = new fabric.Rect({
      left: canvasWidth - safeZone.right,
      top: safeZone.top,
      width: safeZone.right,
      height: canvasHeight - safeZone.top - safeZone.bottom,
      fill: fillColor,
      opacity: fillOpacity,
      selectable: false,
      evented: false,
    });
    objects.push(rightRect);
  }

  // 安全区域边框
  const safeRect = new fabric.Rect({
    left: safeZone.left,
    top: safeZone.top,
    width: canvasWidth - safeZone.left - safeZone.right,
    height: canvasHeight - safeZone.top - safeZone.bottom,
    fill: "transparent",
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    strokeDashArray: [5, 5],
    selectable: false,
    evented: false,
  });
  objects.push(safeRect);

  // 创建组
  const group = new fabric.Group(objects, {
    selectable: false,
    evented: false,
    name: "safeZoneOverlay",
  });

  return group;
}

/**
 * 检查元素是否在安全区域内
 *
 * @param canvas - Fabric.js 画布
 * @param safeZone - 安全区域配置
 * @returns 检查结果
 */
export function checkSafeZone(
  canvas: fabric.Canvas,
  safeZone: SafeZone,
): SafeZoneCheckResult {
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const violations: SafeZoneViolation[] = [];

  const objects = canvas
    .getObjects()
    .filter(
      (obj) => obj.name !== "safeZoneOverlay" && obj.selectable !== false,
    );

  for (const obj of objects) {
    const bounds = obj.getBoundingRect();
    const objName =
      (obj as fabric.Object & { name?: string }).name || obj.type || "未命名";

    // 检查顶部
    if (bounds.top < safeZone.top) {
      violations.push({
        elementName: objName,
        elementType: obj.type || "unknown",
        violatedZone: "top",
        overflowAmount: safeZone.top - bounds.top,
      });
    }

    // 检查底部
    if (bounds.top + bounds.height > canvasHeight - safeZone.bottom) {
      violations.push({
        elementName: objName,
        elementType: obj.type || "unknown",
        violatedZone: "bottom",
        overflowAmount:
          bounds.top + bounds.height - (canvasHeight - safeZone.bottom),
      });
    }

    // 检查左侧
    if (bounds.left < safeZone.left) {
      violations.push({
        elementName: objName,
        elementType: obj.type || "unknown",
        violatedZone: "left",
        overflowAmount: safeZone.left - bounds.left,
      });
    }

    // 检查右侧
    if (bounds.left + bounds.width > canvasWidth - safeZone.right) {
      violations.push({
        elementName: objName,
        elementType: obj.type || "unknown",
        violatedZone: "right",
        overflowAmount:
          bounds.left + bounds.width - (canvasWidth - safeZone.right),
      });
    }
  }

  return {
    isInSafeZone: violations.length === 0,
    violations,
  };
}

/**
 * 根据平台显示安全区域
 *
 * @param canvas - Fabric.js 画布
 * @param platformId - 平台 ID
 * @param options - 显示选项
 * @returns 安全区域对象组，如果平台没有安全区域则返回 null
 */
export function showPlatformSafeZone(
  canvas: fabric.Canvas,
  platformId: PlatformId,
  options?: SafeZoneDisplayOptions,
): fabric.Group | null {
  const spec = getPlatformSpec(platformId);
  if (!spec?.safeZone) return null;

  // 移除已有的安全区域
  hideSafeZone(canvas);

  // 创建新的安全区域
  const overlay = createSafeZoneOverlay(canvas, spec.safeZone, options);
  canvas.add(overlay);
  canvas.renderAll();

  return overlay;
}

/**
 * 隐藏安全区域
 *
 * @param canvas - Fabric.js 画布
 */
export function hideSafeZone(canvas: fabric.Canvas): void {
  const overlay = canvas
    .getObjects()
    .find(
      (obj) =>
        (obj as fabric.Object & { name?: string }).name === "safeZoneOverlay",
    );
  if (overlay) {
    canvas.remove(overlay);
    canvas.renderAll();
  }
}

export default {
  createSafeZoneOverlay,
  checkSafeZone,
  showPlatformSafeZone,
  hideSafeZone,
};
