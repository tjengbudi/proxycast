/**
 * @file 安全区域工具测试
 * @description 测试安全区域功能的正确性
 * @module components/content-creator/canvas/poster/utils/safeZone.test
 */

import { describe, it, expect, vi } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import { checkSafeZone } from "./safeZone";
import type { SafeZone } from "../platforms/types";
import type { fabric } from "fabric";

/**
 * SafeZone 生成器
 */
const safeZoneArb = fc.record({
  top: fc.integer({ min: 0, max: 500 }),
  bottom: fc.integer({ min: 0, max: 500 }),
  left: fc.integer({ min: 0, max: 200 }),
  right: fc.integer({ min: 0, max: 200 }),
});

/**
 * Mock Fabric.js Canvas
 */
function createMockCanvas(
  width: number,
  height: number,
  objects: Array<{
    name?: string;
    type: string;
    left: number;
    top: number;
    width: number;
    height: number;
    selectable?: boolean;
  }>,
) {
  return {
    getWidth: () => width,
    getHeight: () => height,
    getObjects: () =>
      objects.map((obj) => ({
        ...obj,
        type: obj.type,
        selectable: obj.selectable ?? true,
        getBoundingRect: () => ({
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
        }),
      })),
    add: vi.fn(),
    remove: vi.fn(),
    renderAll: vi.fn(),
  } as unknown as fabric.Canvas;
}

describe("安全区域属性测试", () => {
  /**
   * Property: 空画布应该没有违规
   */
  test.prop([safeZoneArb])("空画布应该没有安全区域违规", (safeZone) => {
    const canvas = createMockCanvas(1080, 1440, []);
    const result = checkSafeZone(canvas, safeZone);

    expect(result.isInSafeZone).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  /**
   * Property: 安全区域内的元素不应该有违规
   */
  test.prop([safeZoneArb])("安全区域内的元素不应该有违规", (safeZone) => {
    const canvasWidth = 1080;
    const canvasHeight = 1440;

    // 创建一个在安全区域内的元素
    const elementWidth = 100;
    const elementHeight = 100;
    const safeLeft = safeZone.left + 10;
    const safeTop = safeZone.top + 10;

    // 确保元素在安全区域内
    if (
      safeLeft + elementWidth > canvasWidth - safeZone.right ||
      safeTop + elementHeight > canvasHeight - safeZone.bottom
    ) {
      return; // 跳过无效的测试用例
    }

    const canvas = createMockCanvas(canvasWidth, canvasHeight, [
      {
        name: "safe-element",
        type: "rect",
        left: safeLeft,
        top: safeTop,
        width: elementWidth,
        height: elementHeight,
      },
    ]);

    const result = checkSafeZone(canvas, safeZone);
    expect(result.isInSafeZone).toBe(true);
  });
});

describe("安全区域单元测试", () => {
  describe("checkSafeZone", () => {
    const defaultSafeZone: SafeZone = {
      top: 120,
      bottom: 180,
      left: 40,
      right: 40,
    };

    it("应该检测顶部违规", () => {
      const canvas = createMockCanvas(1080, 1440, [
        {
          name: "top-element",
          type: "textbox",
          left: 100,
          top: 50, // 在安全区域外
          width: 200,
          height: 50,
        },
      ]);

      const result = checkSafeZone(canvas, defaultSafeZone);

      expect(result.isInSafeZone).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].violatedZone).toBe("top");
      expect(result.violations[0].overflowAmount).toBe(70); // 120 - 50
    });

    it("应该检测底部违规", () => {
      const canvas = createMockCanvas(1080, 1440, [
        {
          name: "bottom-element",
          type: "textbox",
          left: 100,
          top: 1300, // 1300 + 200 = 1500 > 1440 - 180 = 1260
          width: 200,
          height: 200,
        },
      ]);

      const result = checkSafeZone(canvas, defaultSafeZone);

      expect(result.isInSafeZone).toBe(false);
      expect(result.violations.some((v) => v.violatedZone === "bottom")).toBe(
        true,
      );
    });

    it("应该检测左侧违规", () => {
      const canvas = createMockCanvas(1080, 1440, [
        {
          name: "left-element",
          type: "textbox",
          left: 10, // 在安全区域外
          top: 200,
          width: 100,
          height: 50,
        },
      ]);

      const result = checkSafeZone(canvas, defaultSafeZone);

      expect(result.isInSafeZone).toBe(false);
      expect(result.violations.some((v) => v.violatedZone === "left")).toBe(
        true,
      );
    });

    it("应该检测右侧违规", () => {
      const canvas = createMockCanvas(1080, 1440, [
        {
          name: "right-element",
          type: "textbox",
          left: 1000, // 1000 + 100 = 1100 > 1080 - 40 = 1040
          top: 200,
          width: 100,
          height: 50,
        },
      ]);

      const result = checkSafeZone(canvas, defaultSafeZone);

      expect(result.isInSafeZone).toBe(false);
      expect(result.violations.some((v) => v.violatedZone === "right")).toBe(
        true,
      );
    });

    it("应该检测多个违规", () => {
      const canvas = createMockCanvas(1080, 1440, [
        {
          name: "corner-element",
          type: "textbox",
          left: 10, // 左侧违规
          top: 50, // 顶部违规
          width: 100,
          height: 50,
        },
      ]);

      const result = checkSafeZone(canvas, defaultSafeZone);

      expect(result.isInSafeZone).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(2);
    });

    it("应该忽略不可选择的元素", () => {
      const canvas = createMockCanvas(1080, 1440, [
        {
          name: "background",
          type: "rect",
          left: 0,
          top: 0,
          width: 1080,
          height: 1440,
          selectable: false,
        },
      ]);

      const result = checkSafeZone(canvas, defaultSafeZone);

      expect(result.isInSafeZone).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("应该忽略安全区域覆盖层", () => {
      const canvas = createMockCanvas(1080, 1440, [
        {
          name: "safeZoneOverlay",
          type: "group",
          left: 0,
          top: 0,
          width: 1080,
          height: 1440,
        },
      ]);

      const result = checkSafeZone(canvas, defaultSafeZone);

      expect(result.isInSafeZone).toBe(true);
    });

    it("应该正确报告违规元素信息", () => {
      const canvas = createMockCanvas(1080, 1440, [
        {
          name: "my-text",
          type: "textbox",
          left: 10,
          top: 200,
          width: 100,
          height: 50,
        },
      ]);

      const result = checkSafeZone(canvas, defaultSafeZone);

      expect(result.violations[0].elementName).toBe("my-text");
      expect(result.violations[0].elementType).toBe("textbox");
    });
  });
});
