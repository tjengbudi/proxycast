/**
 * @file Artifact Hooks 导出入口
 * @description 统一导出 Artifact 相关的 React Hooks
 * @module lib/artifact/hooks
 * @requirements 9.4, 11.2
 */

// useArtifact Hook 导出
export { useArtifact } from "./useArtifact";

// useArtifactParser Hook 导出
export { useArtifactParser } from "./useArtifactParser";
export type { UseArtifactParserReturn } from "./useArtifactParser";

// useDebouncedValue Hook 导出
// @requirements 11.2
export { useDebouncedValue, useDebouncedCallback } from "./useDebouncedValue";
