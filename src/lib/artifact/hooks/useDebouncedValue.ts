/**
 * @file 防抖值 Hook
 * @description 提供防抖更新的值，用于避免频繁重渲染
 * @module lib/artifact/hooks/useDebouncedValue
 * @requirements 11.2
 */

import { useState, useEffect, useRef } from "react";

/**
 * 防抖值 Hook
 *
 * 在指定延迟后更新值，用于避免频繁重渲染。
 * 特别适用于流式内容更新场景。
 *
 * @param value - 原始值
 * @param delay - 防抖延迟（毫秒），默认 100ms
 * @returns 防抖后的值
 *
 * @example
 * ```tsx
 * function StreamingContent({ content }: { content: string }) {
 *   // 内容更新会被防抖处理，避免频繁重渲染
 *   const debouncedContent = useDebouncedValue(content, 100);
 *
 *   return <pre>{debouncedContent}</pre>;
 * }
 * ```
 *
 * @requirements 11.2
 */
export function useDebouncedValue<T>(value: T, delay: number = 100): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的定时器
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖回调 Hook
 *
 * 返回一个防抖处理的回调函数，在指定延迟后执行。
 * 适用于需要防抖处理的事件回调。
 *
 * @param callback - 要防抖处理的回调函数
 * @param delay - 防抖延迟（毫秒），默认 100ms
 * @returns 防抖后的回调函数
 *
 * @example
 * ```tsx
 * function Editor({ onContentChange }: { onContentChange: (content: string) => void }) {
 *   const debouncedOnChange = useDebouncedCallback(onContentChange, 200);
 *
 *   return (
 *     <textarea onChange={(e) => debouncedOnChange(e.target.value)} />
 *   );
 * }
 * ```
 *
 * @requirements 11.2
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number = 100,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // 保持回调引用最新
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return ((...args: Parameters<T>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }) as T;
}
