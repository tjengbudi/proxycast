/**
 * @file 代码渲染器组件
 * @description Artifact 系统的代码渲染器，支持语法高亮、行号显示、复制功能和流式内容更新
 * @module components/artifact/renderers/CodeRenderer
 * @requirements 4.1, 4.2, 4.3, 4.4, 4.6, 14.4
 */

import React, { useState, useCallback, useMemo, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArtifactRendererProps } from "@/lib/artifact/types";

/**
 * 语言名称映射表
 * 将常见的语言别名映射到 Prism 支持的语言名称
 */
const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  py: "python",
  rb: "ruby",
  rs: "rust",
  go: "go",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  dockerfile: "docker",
  plaintext: "text",
  txt: "text",
};

/**
 * 规范化语言名称
 * @param language - 原始语言名称
 * @returns 规范化后的语言名称
 */
function normalizeLanguage(language: string | undefined): string {
  if (!language) return "text";
  const lower = language.toLowerCase().trim();
  return LANGUAGE_ALIASES[lower] || lower;
}

/**
 * 流式指示器组件
 * 显示在代码块底部，表示内容正在流式生成中
 */
const StreamingIndicator: React.FC = memo(() => (
  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">
    <Loader2 className="w-3 h-3 animate-spin" />
    <span>生成中...</span>
  </div>
));
StreamingIndicator.displayName = "StreamingIndicator";

/**
 * 复制按钮组件
 */
interface CopyButtonProps {
  copied: boolean;
  onClick: () => void;
}

const CopyButton: React.FC<CopyButtonProps> = memo(({ copied, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
      "hover:bg-white/10",
      copied ? "text-green-400" : "text-gray-400 hover:text-white",
    )}
    title={copied ? "已复制" : "复制代码"}
  >
    {copied ? (
      <>
        <Check className="w-3.5 h-3.5" />
        <span>已复制</span>
      </>
    ) : (
      <>
        <Copy className="w-3.5 h-3.5" />
        <span>复制</span>
      </>
    )}
  </button>
));
CopyButton.displayName = "CopyButton";

/**
 * 错误显示组件
 * Requirement 14.4
 */
interface ErrorDisplayProps {
  message: string;
  content: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = memo(
  ({ message, content }) => (
    <div className="flex flex-col h-full bg-[#282c34]">
      <div className="flex items-start gap-3 p-4 bg-red-900/30 border-b border-red-500/30">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-red-300 mb-1">
            代码渲染失败
          </h3>
          <p className="text-xs text-red-400">{message}</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <h4 className="text-xs font-medium text-gray-500 mb-2">原始内容：</h4>
        <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
          {content}
        </pre>
      </div>
    </div>
  ),
);
ErrorDisplay.displayName = "ErrorDisplay";

/**
 * 代码渲染器组件
 *
 * 功能特性：
 * - 使用 react-syntax-highlighter 实现语法高亮 (Requirement 4.1)
 * - 显示行号 (Requirement 4.2)
 * - 提供复制到剪贴板功能 (Requirement 4.3)
 * - 支持从 artifact 元数据检测语言 (Requirement 4.4)
 * - 支持流式内容更新，无闪烁 (Requirement 4.6)
 *
 * @param artifact - 要渲染的 Artifact 对象
 * @param isStreaming - 是否处于流式生成状态
 */
export const CodeRenderer: React.FC<ArtifactRendererProps> = memo(
  ({ artifact, isStreaming = false }) => {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 从 artifact 元数据获取语言，并规范化
    const language = useMemo(() => {
      try {
        return normalizeLanguage(artifact.meta.language);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "语言检测失败";
        console.error(
          "[CodeRenderer] Error normalizing language:",
          errorMessage,
          err,
        );
        return "text";
      }
    }, [artifact.meta.language]);

    // 复制代码到剪贴板
    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(artifact.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "复制失败";
        console.error(
          "[CodeRenderer] Error copying to clipboard:",
          errorMessage,
          err,
        );
      }
    }, [artifact.content]);

    // 计算是否显示行号（超过 1 行时显示）
    const showLineNumbers = useMemo(() => {
      try {
        return artifact.content.split("\n").length > 1;
      } catch (err) {
        console.error("[CodeRenderer] Error calculating line numbers:", err);
        return false;
      }
    }, [artifact.content]);

    // 验证内容是否可渲染
    useMemo(() => {
      try {
        if (artifact.content === null || artifact.content === undefined) {
          throw new Error("代码内容为空");
        }
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "内容验证失败";
        console.error(
          "[CodeRenderer] Error validating content:",
          errorMessage,
          err,
        );
        setError(errorMessage);
      }
    }, [artifact.content]);

    // 如果有错误，显示错误界面
    if (error) {
      return <ErrorDisplay message={error} content={artifact.content || ""} />;
    }

    return (
      <div className="relative h-full flex flex-col bg-[#282c34] rounded-lg overflow-hidden">
        {/* 工具栏 */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#21252b] border-b border-white/10">
          <span className="text-xs text-gray-400 font-mono">{language}</span>
          <CopyButton copied={copied} onClick={handleCopy} />
        </div>

        {/* 代码内容区域 */}
        <div className="flex-1 overflow-auto">
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            showLineNumbers={showLineNumbers}
            wrapLines
            wrapLongLines
            customStyle={{
              margin: 0,
              padding: "12px",
              background: "transparent",
              fontSize: "13px",
              lineHeight: "1.6",
              minHeight: "100%",
            }}
            lineNumberStyle={{
              minWidth: "2.5em",
              paddingRight: "1em",
              color: "#636d83",
              userSelect: "none",
            }}
            codeTagProps={{
              style: {
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              },
            }}
          >
            {artifact.content || " "}
          </SyntaxHighlighter>
        </div>

        {/* 流式指示器 */}
        {isStreaming && <StreamingIndicator />}
      </div>
    );
  },
);

CodeRenderer.displayName = "CodeRenderer";

export default CodeRenderer;
