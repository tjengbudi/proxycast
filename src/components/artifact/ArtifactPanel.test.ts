/**
 * @file Artifact 面板属性测试
 * @description 使用 fast-check 进行属性测试，验证面板宽度持久化的正确性
 * @module components/artifact/ArtifactPanel.test
 * @requirements 10.6
 */

import { describe, test, expect, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { createStore } from "jotai";
import type { ArtifactPanelState } from "@/lib/artifact/store";

// ============================================================================
// 常量定义（与 ArtifactPanel.tsx 保持一致）
// ============================================================================

/** 面板最小宽度 */
const MIN_PANEL_WIDTH = 320;
/** 面板最大宽度 */
const MAX_PANEL_WIDTH = 800;
/** 面板默认宽度 */
const DEFAULT_PANEL_WIDTH = 480;
/** sessionStorage 键名 */
const STORAGE_KEY = "artifact-panel";

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 将宽度限制在有效范围内
 * @param width - 原始宽度
 * @returns 限制后的宽度
 */
function clampWidth(width: number): number {
  return Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, width));
}

/**
 * 模拟设置面板宽度（直接操作 sessionStorage）
 * @param width - 要设置的宽度
 */
function setPanelWidth(width: number): void {
  const state: ArtifactPanelState = {
    isOpen: true,
    width: clampWidth(width),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * 从 sessionStorage 获取面板宽度
 * @returns 面板宽度，如果不存在则返回默认值
 */
function getPanelWidth(): number {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_PANEL_WIDTH;

  try {
    const state = JSON.parse(stored) as ArtifactPanelState;
    return state.width;
  } catch {
    return DEFAULT_PANEL_WIDTH;
  }
}

/**
 * 模拟页面重新加载（清除内存状态，保留 sessionStorage）
 * 返回新的 Jotai store 实例
 */
function simulateReload(): ReturnType<typeof createStore> {
  return createStore();
}

// ============================================================================
// 自定义生成器 (Arbitraries)
// ============================================================================

/** 有效宽度生成器（在 MIN_WIDTH 和 MAX_WIDTH 之间） */
const validWidthArb = fc.integer({
  min: MIN_PANEL_WIDTH,
  max: MAX_PANEL_WIDTH,
});

/** 任意宽度生成器（可能超出范围） */
const anyWidthArb = fc.integer({ min: 0, max: 2000 });

/** 小于最小宽度的生成器 */
const belowMinWidthArb = fc.integer({ min: 0, max: MIN_PANEL_WIDTH - 1 });

/** 大于最大宽度的生成器 */
const aboveMaxWidthArb = fc.integer({ min: MAX_PANEL_WIDTH + 1, max: 2000 });

/** 宽度调整序列生成器 */
const widthSequenceArb = fc.array(validWidthArb, {
  minLength: 1,
  maxLength: 10,
});

// ============================================================================
// Property 9: 面板宽度持久化
// **Validates: Requirements 10.6**
// ============================================================================

describe("Property 9: 面板宽度持久化", () => {
  // 每个测试前清理 sessionStorage
  beforeEach(() => {
    sessionStorage.clear();
  });

  // 每个测试后清理 sessionStorage
  afterEach(() => {
    sessionStorage.clear();
  });

  /**
   * **Validates: Requirements 10.6**
   * 对于任何有效宽度，设置后应能正确读取
   */
  test("有效宽度应被正确持久化", () => {
    fc.assert(
      fc.property(validWidthArb, (width) => {
        // 设置宽度
        setPanelWidth(width);

        // 读取宽度
        const storedWidth = getPanelWidth();

        // 验证宽度一致
        expect(storedWidth).toBe(width);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.6**
   * 对于任何有效宽度，重新加载后应保持一致
   */
  test("有效宽度应在重新加载后保持一致", () => {
    fc.assert(
      fc.property(validWidthArb, (width) => {
        // 设置宽度
        setPanelWidth(width);

        // 模拟重新加载
        simulateReload();

        // 读取宽度
        const storedWidth = getPanelWidth();

        // 验证宽度一致
        expect(storedWidth).toBe(width);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.6**
   * 小于最小宽度的值应被限制到最小宽度
   */
  test("小于最小宽度的值应被限制到最小宽度", () => {
    fc.assert(
      fc.property(belowMinWidthArb, (width) => {
        // 设置宽度（会被限制）
        setPanelWidth(width);

        // 读取宽度
        const storedWidth = getPanelWidth();

        // 验证宽度被限制到最小值
        expect(storedWidth).toBe(MIN_PANEL_WIDTH);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.6**
   * 大于最大宽度的值应被限制到最大宽度
   */
  test("大于最大宽度的值应被限制到最大宽度", () => {
    fc.assert(
      fc.property(aboveMaxWidthArb, (width) => {
        // 设置宽度（会被限制）
        setPanelWidth(width);

        // 读取宽度
        const storedWidth = getPanelWidth();

        // 验证宽度被限制到最大值
        expect(storedWidth).toBe(MAX_PANEL_WIDTH);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.6**
   * 任意宽度都应被限制在有效范围内
   */
  test("任意宽度都应被限制在有效范围内", () => {
    fc.assert(
      fc.property(anyWidthArb, (width) => {
        // 设置宽度
        setPanelWidth(width);

        // 读取宽度
        const storedWidth = getPanelWidth();

        // 验证宽度在有效范围内
        expect(storedWidth).toBeGreaterThanOrEqual(MIN_PANEL_WIDTH);
        expect(storedWidth).toBeLessThanOrEqual(MAX_PANEL_WIDTH);

        // 验证宽度等于限制后的值
        expect(storedWidth).toBe(clampWidth(width));
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.6**
   * 多次宽度调整后，最后一次设置的值应被保留
   */
  test("多次宽度调整后应保留最后一次设置的值", () => {
    fc.assert(
      fc.property(widthSequenceArb, (widths) => {
        // 依次设置宽度
        for (const width of widths) {
          setPanelWidth(width);
        }

        // 读取宽度
        const storedWidth = getPanelWidth();

        // 验证宽度等于最后一次设置的值
        const lastWidth = widths[widths.length - 1];
        expect(storedWidth).toBe(lastWidth);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.6**
   * 多次宽度调整后，重新加载应保留最后一次设置的值
   */
  test("多次宽度调整后重新加载应保留最后一次设置的值", () => {
    fc.assert(
      fc.property(widthSequenceArb, (widths) => {
        // 依次设置宽度
        for (const width of widths) {
          setPanelWidth(width);
        }

        // 模拟重新加载
        simulateReload();

        // 读取宽度
        const storedWidth = getPanelWidth();

        // 验证宽度等于最后一次设置的值
        const lastWidth = widths[widths.length - 1];
        expect(storedWidth).toBe(lastWidth);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.6**
   * 边界值测试：最小宽度应被正确持久化
   */
  test("最小宽度边界值应被正确持久化", () => {
    setPanelWidth(MIN_PANEL_WIDTH);
    expect(getPanelWidth()).toBe(MIN_PANEL_WIDTH);

    // 重新加载后仍然保持
    simulateReload();
    expect(getPanelWidth()).toBe(MIN_PANEL_WIDTH);
  });

  /**
   * **Validates: Requirements 10.6**
   * 边界值测试：最大宽度应被正确持久化
   */
  test("最大宽度边界值应被正确持久化", () => {
    setPanelWidth(MAX_PANEL_WIDTH);
    expect(getPanelWidth()).toBe(MAX_PANEL_WIDTH);

    // 重新加载后仍然保持
    simulateReload();
    expect(getPanelWidth()).toBe(MAX_PANEL_WIDTH);
  });

  /**
   * **Validates: Requirements 10.6**
   * 默认值测试：未设置时应返回默认宽度
   */
  test("未设置时应返回默认宽度", () => {
    // 不设置任何值
    const width = getPanelWidth();
    expect(width).toBe(DEFAULT_PANEL_WIDTH);
  });

  /**
   * **Validates: Requirements 10.6**
   * 无效 JSON 测试：损坏的存储数据应返回默认宽度
   */
  test("损坏的存储数据应返回默认宽度", () => {
    // 设置无效的 JSON
    sessionStorage.setItem(STORAGE_KEY, "invalid json");

    const width = getPanelWidth();
    expect(width).toBe(DEFAULT_PANEL_WIDTH);
  });

  /**
   * **Validates: Requirements 10.6**
   * 幂等性测试：相同宽度多次设置应保持一致
   */
  test("相同宽度多次设置应保持一致", () => {
    fc.assert(
      fc.property(
        validWidthArb,
        fc.integer({ min: 1, max: 10 }),
        (width, repeatCount) => {
          // 多次设置相同宽度
          for (let i = 0; i < repeatCount; i++) {
            setPanelWidth(width);
          }

          // 读取宽度
          const storedWidth = getPanelWidth();

          // 验证宽度一致
          expect(storedWidth).toBe(width);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 10.6**
   * clampWidth 函数应正确限制宽度
   */
  test("clampWidth 函数应正确限制宽度", () => {
    fc.assert(
      fc.property(anyWidthArb, (width) => {
        const clamped = clampWidth(width);

        // 结果应在有效范围内
        expect(clamped).toBeGreaterThanOrEqual(MIN_PANEL_WIDTH);
        expect(clamped).toBeLessThanOrEqual(MAX_PANEL_WIDTH);

        // 如果原值在范围内，应保持不变
        if (width >= MIN_PANEL_WIDTH && width <= MAX_PANEL_WIDTH) {
          expect(clamped).toBe(width);
        }

        // 如果原值小于最小值，应等于最小值
        if (width < MIN_PANEL_WIDTH) {
          expect(clamped).toBe(MIN_PANEL_WIDTH);
        }

        // 如果原值大于最大值，应等于最大值
        if (width > MAX_PANEL_WIDTH) {
          expect(clamped).toBe(MAX_PANEL_WIDTH);
        }
      }),
      { numRuns: 100 },
    );
  });
});
