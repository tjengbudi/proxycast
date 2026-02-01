/**
 * @file Artifact 模块导出入口
 * @description 统一导出 Artifact 系统的所有公共 API
 * @module lib/artifact
 * @requirements 1.1
 */

// 类型定义导出
export type {
  ArtifactType,
  ArtifactStatus,
  ArtifactMeta,
  Artifact,
  ArtifactRendererProps,
  RendererEntry,
} from "./types";

// 常量和工具函数导出
export {
  LIGHTWEIGHT_ARTIFACT_TYPES,
  CANVAS_ARTIFACT_TYPES,
  ALL_ARTIFACT_TYPES,
  DEFAULT_FILE_EXTENSIONS,
  isCanvasType,
  isLightweightType,
} from "./types";

// 解析器导出
export type {
  ParseResult,
  ParserConfig,
  ParseError,
  ParseErrorType,
} from "./parser";
export {
  ArtifactParser,
  serializeArtifact,
  artifactContentEqual,
  artifactsEqual,
} from "./parser";

// 注册表导出
export { artifactRegistry, ArtifactRegistry } from "./registry";

// 状态管理导出
export type { ArtifactAction, ArtifactPanelState } from "./store";
export {
  artifactsAtom,
  selectedArtifactIdAtom,
  selectedArtifactAtom,
  streamingArtifactAtom,
  artifactPanelStateAtom,
  artifactActionsAtom,
  artifactCountAtom,
  hasSelectedArtifactAtom,
  isStreamingAtom,
} from "./store";

// Hooks 导出
export { useArtifact, useArtifactParser } from "./hooks";
export type { UseArtifactParserReturn } from "./hooks";
