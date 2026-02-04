/**
 * @file useAgentIntegration.ts
 * @description Agent 画布集成 Hook，将 Agent 输出应用到 Fabric.js 画布
 * @module components/content-creator/canvas/poster/hooks/useAgentIntegration
 */

import { useCallback } from "react";
import { fabric } from "fabric";
import type {
  LayoutScheme,
  RefineSuggestion,
} from "@/components/content-creator/agents/base/types";

export interface UseAgentIntegrationReturn {
  /** 应用布局方案到画布 */
  applyLayout: (layout: LayoutScheme) => Promise<void>;
  /** 应用单个元素更新 */
  applyElementUpdate: (
    targetName: string,
    property: string,
    value: unknown,
  ) => void;
  /** 应用优化建议 */
  applyRefinement: (suggestion: RefineSuggestion) => void;
  /** 批量应用优化建议 */
  applyRefinements: (suggestions: RefineSuggestion[]) => void;
  /** 获取当前画布 JSON */
  getCanvasJson: () => Record<string, unknown> | null;
}

/**
 * Agent 画布集成 Hook
 *
 * 提供将 Agent 输出应用到 Fabric.js 画布的方法。
 *
 * @param canvas - Fabric.js 画布实例
 */
export function useAgentIntegration(
  canvas: fabric.Canvas | null,
): UseAgentIntegrationReturn {
  /**
   * 应用布局方案到画布
   */
  const applyLayout = useCallback(
    async (layout: LayoutScheme): Promise<void> => {
      if (!canvas) return;

      // 清空画布
      canvas.clear();

      // 加载布局
      return new Promise((resolve) => {
        canvas.loadFromJSON(layout.fabricJson, () => {
          canvas.renderAll();
          resolve();
        });
      });
    },
    [canvas],
  );

  /**
   * 应用单个元素更新
   */
  const applyElementUpdate = useCallback(
    (targetName: string, property: string, value: unknown): void => {
      if (!canvas) return;

      const objects = canvas.getObjects();
      const target = objects.find(
        (obj: fabric.Object) =>
          (obj as fabric.Object & { name?: string }).name === targetName,
      );

      if (target) {
        target.set(property as keyof typeof target, value);
        canvas.renderAll();
      }
    },
    [canvas],
  );

  /**
   * 应用优化建议
   */
  const applyRefinement = useCallback(
    (suggestion: RefineSuggestion): void => {
      if (!canvas) return;

      const { action } = suggestion;

      switch (action.type) {
        case "adjust":
          if (action.property && action.value !== undefined) {
            // 处理相对值（如 "+20"）
            const value =
              typeof action.value === "string" && action.value.startsWith("+")
                ? parseFloat(action.value)
                : action.value;

            if (action.target === "text-elements") {
              // 批量调整所有文字元素
              const textObjects = canvas
                .getObjects()
                .filter((obj: fabric.Object) => obj.type === "textbox");
              textObjects.forEach((obj: fabric.Object) => {
                if (typeof value === "number") {
                  const currentValue = obj.get(
                    action.property as keyof typeof obj,
                  ) as number;
                  obj.set(
                    action.property as keyof typeof obj,
                    currentValue + value,
                  );
                } else {
                  obj.set(action.property as keyof typeof obj, value);
                }
              });
            } else {
              // 调整单个元素
              applyElementUpdate(action.target, action.property, value);
            }
          }
          break;

        case "add":
          // 添加新元素
          // TODO: 实现添加元素逻辑
          break;

        case "remove": {
          // 移除元素
          const removeObjects = canvas.getObjects();
          const targetObj = removeObjects.find(
            (obj: fabric.Object) =>
              (obj as fabric.Object & { name?: string }).name === action.target,
          );
          if (targetObj) {
            canvas.remove(targetObj);
          }
          break;
        }

        case "replace":
          // 替换元素
          // TODO: 实现替换元素逻辑
          break;
      }

      canvas.renderAll();
    },
    [canvas, applyElementUpdate],
  );

  /**
   * 批量应用优化建议
   */
  const applyRefinements = useCallback(
    (suggestions: RefineSuggestion[]): void => {
      suggestions.forEach((suggestion) => {
        applyRefinement(suggestion);
      });
    },
    [applyRefinement],
  );

  /**
   * 获取当前画布 JSON
   */
  const getCanvasJson = useCallback((): Record<string, unknown> | null => {
    if (!canvas) return null;
    return canvas.toJSON() as Record<string, unknown>;
  }, [canvas]);

  return {
    applyLayout,
    applyElementUpdate,
    applyRefinement,
    applyRefinements,
    getCanvasJson,
  };
}

export default useAgentIntegration;
