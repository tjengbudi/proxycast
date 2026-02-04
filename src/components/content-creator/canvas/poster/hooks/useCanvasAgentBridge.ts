/**
 * @file useCanvasAgentBridge.ts
 * @description 画布与 Agent 桥接 Hook
 * @module components/content-creator/canvas/poster/hooks/useCanvasAgentBridge
 */

import { useCallback, useState, useRef } from "react";
import { fabric } from "fabric";
import type {
  AgentSuggestion,
  LayoutScheme,
  RefineSuggestion,
} from "@/components/content-creator/agents/base/types";

/**
 * 画布操作历史记录
 */
interface CanvasOperation {
  /** 操作 ID */
  id: string;
  /** 操作类型 */
  type: "apply_layout" | "apply_suggestion" | "apply_refinement" | "undo";
  /** 操作前状态 */
  beforeState: string;
  /** 操作后状态 */
  afterState: string;
  /** 时间戳 */
  timestamp: Date;
  /** 描述 */
  description: string;
}

/**
 * Hook 返回值
 */
export interface UseCanvasAgentBridgeReturn {
  /** 应用布局方案 */
  applyLayout: (layout: LayoutScheme) => Promise<boolean>;
  /** 应用 Agent 建议 */
  applySuggestion: (suggestion: AgentSuggestion) => Promise<boolean>;
  /** 应用优化建议 */
  applyRefinement: (refinement: RefineSuggestion) => Promise<boolean>;
  /** 批量应用优化建议 */
  applyRefinements: (refinements: RefineSuggestion[]) => Promise<boolean>;
  /** 撤销上一次操作 */
  undoLastOperation: () => boolean;
  /** 获取画布状态快照 */
  getCanvasSnapshot: () => string | null;
  /** 从快照恢复 */
  restoreFromSnapshot: (snapshot: string) => Promise<boolean>;
  /** 操作历史 */
  operationHistory: CanvasOperation[];
  /** 是否正在处理 */
  isProcessing: boolean;
  /** 最后一次错误 */
  lastError: string | null;
  /** 清除错误 */
  clearError: () => void;
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 画布与 Agent 桥接 Hook
 *
 * 提供画布与 Agent 系统之间的交互桥接。
 *
 * @param canvas - Fabric.js 画布实例
 */
export function useCanvasAgentBridge(
  canvas: fabric.Canvas | null,
): UseCanvasAgentBridgeReturn {
  const [operationHistory, setOperationHistory] = useState<CanvasOperation[]>(
    [],
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // 保存操作前状态
  const beforeStateRef = useRef<string | null>(null);

  /**
   * 获取画布状态快照
   */
  const getCanvasSnapshot = useCallback((): string | null => {
    if (!canvas) return null;
    return JSON.stringify(canvas.toJSON());
  }, [canvas]);

  /**
   * 从快照恢复
   */
  const restoreFromSnapshot = useCallback(
    async (snapshot: string): Promise<boolean> => {
      if (!canvas) return false;

      return new Promise((resolve) => {
        try {
          const json = JSON.parse(snapshot);
          canvas.loadFromJSON(json, () => {
            canvas.renderAll();
            resolve(true);
          });
        } catch (_error) {
          setLastError("恢复快照失败");
          resolve(false);
        }
      });
    },
    [canvas],
  );

  /**
   * 记录操作
   */
  const recordOperation = useCallback(
    (
      type: CanvasOperation["type"],
      description: string,
      beforeState: string,
      afterState: string,
    ) => {
      const operation: CanvasOperation = {
        id: generateId(),
        type,
        beforeState,
        afterState,
        timestamp: new Date(),
        description,
      };
      setOperationHistory((prev) => [...prev, operation]);
    },
    [],
  );

  /**
   * 应用布局方案
   */
  const applyLayout = useCallback(
    async (layout: LayoutScheme): Promise<boolean> => {
      if (!canvas) {
        setLastError("画布未初始化");
        return false;
      }

      setIsProcessing(true);
      setLastError(null);
      beforeStateRef.current = getCanvasSnapshot();

      try {
        // 清空画布
        canvas.clear();

        // 加载布局 JSON
        return new Promise((resolve) => {
          canvas.loadFromJSON(layout.fabricJson, () => {
            canvas.renderAll();

            // 记录操作
            const afterState = getCanvasSnapshot();
            if (beforeStateRef.current && afterState) {
              recordOperation(
                "apply_layout",
                `应用布局: ${layout.name}`,
                beforeStateRef.current,
                afterState,
              );
            }

            setIsProcessing(false);
            resolve(true);
          });
        });
      } catch (error) {
        setLastError(error instanceof Error ? error.message : "应用布局失败");
        setIsProcessing(false);
        return false;
      }
    },
    [canvas, getCanvasSnapshot, recordOperation],
  );

  /**
   * 应用 Agent 建议
   */
  const applySuggestion = useCallback(
    async (suggestion: AgentSuggestion): Promise<boolean> => {
      if (!canvas) {
        setLastError("画布未初始化");
        return false;
      }

      setIsProcessing(true);
      setLastError(null);
      beforeStateRef.current = getCanvasSnapshot();

      try {
        const content = suggestion.content;

        // 根据建议类型处理
        if (typeof content === "object" && content !== null) {
          // 如果是布局方案
          if ("fabricJson" in content) {
            return applyLayout(content as LayoutScheme);
          }

          // 如果是优化建议
          if ("action" in content) {
            return applyRefinement(content as RefineSuggestion);
          }

          // 如果是样式更新
          if ("property" in content && "value" in content) {
            const { target, property, value } = content as {
              target?: string;
              property: string;
              value: unknown;
            };

            if (target) {
              // 更新指定元素
              const objects = canvas.getObjects();
              const targetObj = objects.find(
                (obj) =>
                  (obj as fabric.Object & { name?: string }).name === target,
              );
              if (targetObj) {
                targetObj.set(property as keyof typeof targetObj, value);
                canvas.renderAll();
              }
            } else {
              // 更新选中元素
              const activeObject = canvas.getActiveObject();
              if (activeObject) {
                activeObject.set(property as keyof typeof activeObject, value);
                canvas.renderAll();
              }
            }
          }
        }

        // 记录操作
        const afterState = getCanvasSnapshot();
        if (beforeStateRef.current && afterState) {
          recordOperation(
            "apply_suggestion",
            `应用建议: ${suggestion.title}`,
            beforeStateRef.current,
            afterState,
          );
        }

        setIsProcessing(false);
        return true;
      } catch (error) {
        setLastError(error instanceof Error ? error.message : "应用建议失败");
        setIsProcessing(false);
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvas, getCanvasSnapshot, recordOperation, applyLayout],
  );

  /**
   * 应用优化建议
   */
  const applyRefinement = useCallback(
    async (refinement: RefineSuggestion): Promise<boolean> => {
      if (!canvas) {
        setLastError("画布未初始化");
        return false;
      }

      setIsProcessing(true);
      setLastError(null);
      beforeStateRef.current = getCanvasSnapshot();

      try {
        const { action } = refinement;

        switch (action.type) {
          case "adjust": {
            if (!action.property || action.value === undefined) break;

            const objects = canvas.getObjects();
            let targets: fabric.Object[] = [];

            // 确定目标元素
            if (action.target === "text-elements") {
              targets = objects.filter((obj) => obj.type === "textbox");
            } else if (action.target === "all") {
              targets = objects;
            } else {
              const target = objects.find(
                (obj) =>
                  (obj as fabric.Object & { name?: string }).name ===
                  action.target,
              );
              if (target) targets = [target];
            }

            // 应用调整
            targets.forEach((obj) => {
              let value = action.value;

              // 处理相对值
              if (typeof value === "string" && value.startsWith("+")) {
                const delta = parseFloat(value);
                const current = obj.get(
                  action.property as keyof typeof obj,
                ) as number;
                value = current + delta;
              } else if (typeof value === "string" && value.startsWith("-")) {
                const delta = parseFloat(value);
                const current = obj.get(
                  action.property as keyof typeof obj,
                ) as number;
                value = current + delta;
              }

              obj.set(action.property as keyof typeof obj, value);
            });
            break;
          }

          case "remove": {
            const objects = canvas.getObjects();
            const target = objects.find(
              (obj) =>
                (obj as fabric.Object & { name?: string }).name ===
                action.target,
            );
            if (target) {
              canvas.remove(target);
            }
            break;
          }

          case "add": {
            // TODO: 实现添加元素逻辑
            break;
          }

          case "replace": {
            // TODO: 实现替换元素逻辑
            break;
          }
        }

        canvas.renderAll();

        // 记录操作
        const afterState = getCanvasSnapshot();
        if (beforeStateRef.current && afterState) {
          recordOperation(
            "apply_refinement",
            `应用优化: ${refinement.description}`,
            beforeStateRef.current,
            afterState,
          );
        }

        setIsProcessing(false);
        return true;
      } catch (error) {
        setLastError(
          error instanceof Error ? error.message : "应用优化建议失败",
        );
        setIsProcessing(false);
        return false;
      }
    },
    [canvas, getCanvasSnapshot, recordOperation],
  );

  /**
   * 批量应用优化建议
   */
  const applyRefinements = useCallback(
    async (refinements: RefineSuggestion[]): Promise<boolean> => {
      if (!canvas || refinements.length === 0) return false;

      setIsProcessing(true);
      beforeStateRef.current = getCanvasSnapshot();

      let success = true;
      for (const refinement of refinements) {
        const result = await applyRefinement(refinement);
        if (!result) {
          success = false;
          break;
        }
      }

      setIsProcessing(false);
      return success;
    },
    [canvas, getCanvasSnapshot, applyRefinement],
  );

  /**
   * 撤销上一次操作
   */
  const undoLastOperation = useCallback((): boolean => {
    if (!canvas || operationHistory.length === 0) return false;

    const lastOperation = operationHistory[operationHistory.length - 1];

    try {
      const json = JSON.parse(lastOperation.beforeState);
      canvas.loadFromJSON(json, () => {
        canvas.renderAll();
      });

      // 移除最后一条记录
      setOperationHistory((prev) => prev.slice(0, -1));
      return true;
    } catch (_error) {
      setLastError("撤销操作失败");
      return false;
    }
  }, [canvas, operationHistory]);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  return {
    applyLayout,
    applySuggestion,
    applyRefinement,
    applyRefinements,
    undoLastOperation,
    getCanvasSnapshot,
    restoreFromSnapshot,
    operationHistory,
    isProcessing,
    lastError,
    clearError,
  };
}

export default useCanvasAgentBridge;
