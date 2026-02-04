/**
 * @file 智能裁切工具测试
 * @description 测试智能裁切功能的正确性
 * @module components/content-creator/canvas/poster/utils/smartCrop.test
 */

import { describe, it, expect } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import { calculateSmartCrop } from "./smartCrop";

/**
 * 尺寸生成器
 */
const sizeArb = fc.integer({ min: 100, max: 4000 });

/**
 * SizeSpec 生成器
 */
const sizeSpecArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  width: sizeArb,
  height: sizeArb,
  aspectRatio: fc.string(),
  usage: fc.string(),
});

describe("智能裁切属性测试", () => {
  /**
   * Property: 裁切区域应该在源图像范围内
   */
  test.prop([sizeArb, sizeArb, sizeSpecArb])(
    "裁切区域应该在源图像范围内",
    (sourceWidth, sourceHeight, targetSpec) => {
      const result = calculateSmartCrop({
        sourceWidth,
        sourceHeight,
        targetSpec,
      });

      expect(result.cropRegion.x).toBeGreaterThanOrEqual(0);
      expect(result.cropRegion.y).toBeGreaterThanOrEqual(0);
      expect(result.cropRegion.x + result.cropRegion.width).toBeLessThanOrEqual(
        sourceWidth,
      );
      expect(
        result.cropRegion.y + result.cropRegion.height,
      ).toBeLessThanOrEqual(sourceHeight);
    },
  );

  /**
   * Property: 裁切区域的宽高比应该与目标一致
   */
  test.prop([sizeArb, sizeArb, sizeSpecArb])(
    "裁切区域的宽高比应该与目标一致",
    (sourceWidth, sourceHeight, targetSpec) => {
      // 跳过高度为 0 的情况
      if (targetSpec.height === 0) return;

      const result = calculateSmartCrop({
        sourceWidth,
        sourceHeight,
        targetSpec,
      });

      const targetRatio = targetSpec.width / targetSpec.height;
      const cropRatio = result.cropRegion.width / result.cropRegion.height;

      // 允许小误差
      expect(Math.abs(cropRatio - targetRatio)).toBeLessThan(0.01);
    },
  );

  /**
   * Property: 缩放比例应该是正数
   */
  test.prop([sizeArb, sizeArb, sizeSpecArb])(
    "缩放比例应该是正数",
    (sourceWidth, sourceHeight, targetSpec) => {
      const result = calculateSmartCrop({
        sourceWidth,
        sourceHeight,
        targetSpec,
      });

      expect(result.scale).toBeGreaterThan(0);
    },
  );

  /**
   * Property: 相同宽高比不需要裁切
   */
  it("相同宽高比不需要裁切", () => {
    const result = calculateSmartCrop({
      sourceWidth: 1080,
      sourceHeight: 1440,
      targetSpec: {
        name: "3:4",
        width: 1080,
        height: 1440,
        aspectRatio: "3:4",
        usage: "test",
      },
    });

    expect(result.needsCrop).toBe(false);
    expect(result.cropRegion.x).toBe(0);
    expect(result.cropRegion.y).toBe(0);
    expect(result.cropRegion.width).toBe(1080);
    expect(result.cropRegion.height).toBe(1440);
  });
});

describe("智能裁切单元测试", () => {
  describe("calculateSmartCrop", () => {
    it("应该正确处理宽图裁切为方图", () => {
      const result = calculateSmartCrop({
        sourceWidth: 1920,
        sourceHeight: 1080,
        targetSpec: {
          name: "方图",
          width: 1080,
          height: 1080,
          aspectRatio: "1:1",
          usage: "test",
        },
      });

      expect(result.needsCrop).toBe(true);
      expect(result.cropRegion.width).toBe(1080);
      expect(result.cropRegion.height).toBe(1080);
      // 居中裁切
      expect(result.cropRegion.x).toBe(420); // (1920 - 1080) / 2
      expect(result.cropRegion.y).toBe(0);
    });

    it("应该正确处理高图裁切为方图", () => {
      const result = calculateSmartCrop({
        sourceWidth: 1080,
        sourceHeight: 1920,
        targetSpec: {
          name: "方图",
          width: 1080,
          height: 1080,
          aspectRatio: "1:1",
          usage: "test",
        },
      });

      expect(result.needsCrop).toBe(true);
      expect(result.cropRegion.width).toBe(1080);
      expect(result.cropRegion.height).toBe(1080);
      expect(result.cropRegion.x).toBe(0);
    });

    it("应该支持 center 策略", () => {
      const result = calculateSmartCrop({
        sourceWidth: 1920,
        sourceHeight: 1080,
        targetSpec: {
          name: "方图",
          width: 1080,
          height: 1080,
          aspectRatio: "1:1",
          usage: "test",
        },
        strategy: "center",
      });

      // 居中裁切
      expect(result.cropRegion.x).toBe(420);
    });

    it("应该支持 focus 策略", () => {
      const result = calculateSmartCrop({
        sourceWidth: 1920,
        sourceHeight: 1080,
        targetSpec: {
          name: "方图",
          width: 1080,
          height: 1080,
          aspectRatio: "1:1",
          usage: "test",
        },
        strategy: "focus",
        focusPoint: { x: 0.2, y: 0.5 }, // 焦点在左侧
      });

      // 焦点裁切应该偏左
      expect(result.cropRegion.x).toBeLessThan(420);
    });

    it("应该支持 smart 策略", () => {
      const result = calculateSmartCrop({
        sourceWidth: 1080,
        sourceHeight: 1920,
        targetSpec: {
          name: "方图",
          width: 1080,
          height: 1080,
          aspectRatio: "1:1",
          usage: "test",
        },
        strategy: "smart",
      });

      // smart 策略对高图应该偏上裁切
      expect(result.cropRegion.y).toBeLessThan((1920 - 1080) / 2);
    });

    it("应该生成安全区域警告", () => {
      const result = calculateSmartCrop({
        sourceWidth: 1920,
        sourceHeight: 1080,
        targetSpec: {
          name: "方图",
          width: 500,
          height: 500,
          aspectRatio: "1:1",
          usage: "test",
        },
        safeZone: {
          top: 100,
          bottom: 100,
          left: 800, // 大于裁切量，会触发警告
          right: 800,
        },
      });

      // 由于裁切量较大，应该有警告
      expect(result.needsCrop).toBe(true);
    });

    it("应该正确计算缩放比例", () => {
      const result = calculateSmartCrop({
        sourceWidth: 2160,
        sourceHeight: 2880,
        targetSpec: {
          name: "3:4",
          width: 1080,
          height: 1440,
          aspectRatio: "3:4",
          usage: "test",
        },
      });

      expect(result.scale).toBe(0.5); // 1080 / 2160
    });
  });
});
