/**
 * @file Artifact 工具栏组件
 * @description 提供 Artifact 的快捷操作：复制、下载、源码切换、新窗口打开、关闭
 * @module components/artifact/ArtifactToolbar
 * @requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

import React, { useState, useCallback, memo } from "react";
import {
  Copy,
  Check,
  Download,
  Code,
  Eye,
  ExternalLink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { artifactRegistry } from "@/lib/artifact/registry";
import type { Artifact } from "@/lib/artifact/types";

/**
 * 工具栏按钮组件 Props
 */
interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}

/**
 * 工具栏按钮组件
 * 统一的按钮样式
 */
const ToolbarButton: React.FC<ToolbarButtonProps> = memo(
  ({ onClick, title, disabled = false, active = false, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded transition-all",
        "hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed",
        active ? "bg-white/15 text-white" : "text-gray-400 hover:text-white",
      )}
    >
      {children}
    </button>
  ),
);
ToolbarButton.displayName = "ToolbarButton";

/**
 * ArtifactToolbar Props
 */
export interface ArtifactToolbarProps {
  /** 要操作的 Artifact 对象 */
  artifact: Artifact;
  /** 当前是否显示源码视图 */
  showSource?: boolean;
  /** 源码切换回调 */
  onToggleSource?: () => void;
  /** 关闭回调 */
  onClose?: () => void;
}

/**
 * 下载 Blob 文件的辅助函数
 * @param blob - 要下载的 Blob 对象
 * @param filename - 文件名
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * HTML 转义函数
 * @param str - 要转义的字符串
 * @returns 转义后的字符串
 */
function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 根据 Artifact 类型和元数据生成文件名
 * @param artifact - Artifact 对象
 * @returns 文件名
 */
function generateFilename(artifact: Artifact): string {
  // 如果元数据中有文件名，优先使用
  if (artifact.meta.filename) {
    return artifact.meta.filename;
  }

  // 获取文件扩展名
  const ext = artifactRegistry.getFileExtension(artifact.type);

  // 对于代码类型，根据语言选择扩展名
  if (artifact.type === "code" && artifact.meta.language) {
    const langExt = getLanguageExtension(artifact.meta.language);
    return `${sanitizeFilename(artifact.title)}.${langExt}`;
  }

  return `${sanitizeFilename(artifact.title)}.${ext}`;
}

/**
 * 根据语言获取文件扩展名
 * @param language - 编程语言
 * @returns 文件扩展名
 */
function getLanguageExtension(language: string): string {
  const langExtMap: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    rust: "rs",
    go: "go",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "cs",
    ruby: "rb",
    php: "php",
    swift: "swift",
    kotlin: "kt",
    scala: "scala",
    html: "html",
    css: "css",
    scss: "scss",
    less: "less",
    json: "json",
    yaml: "yaml",
    yml: "yml",
    xml: "xml",
    markdown: "md",
    sql: "sql",
    shell: "sh",
    bash: "sh",
    powershell: "ps1",
    dockerfile: "dockerfile",
    tsx: "tsx",
    jsx: "jsx",
    vue: "vue",
    svelte: "svelte",
  };

  const lower = language.toLowerCase();
  // 使用 in 操作符检查，避免原型链上的属性
  return lower in langExtMap ? langExtMap[lower] : "txt";
}

/**
 * 清理文件名，移除非法字符
 * @param name - 原始文件名
 * @returns 清理后的文件名
 */
function sanitizeFilename(name: string): string {
  // 移除或替换非法字符
  const sanitized = name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .trim();

  // 如果为空，使用默认名称
  return sanitized || "artifact";
}

/**
 * Artifact 工具栏组件
 *
 * 功能特性：
 * - 复制内容到剪贴板 (Requirement 13.1)
 * - 下载文件，根据类型选择正确的扩展名 (Requirement 13.2)
 * - 源码/预览视图切换 (Requirement 13.3)
 * - 在新窗口中打开 (Requirement 13.4)
 * - 关闭按钮 (Requirement 13.5)
 * - 紧凑的水平布局 (Requirement 13.6)
 *
 * @param artifact - 要操作的 Artifact 对象
 * @param showSource - 当前是否显示源码视图
 * @param onToggleSource - 源码切换回调
 * @param onClose - 关闭回调
 */
export const ArtifactToolbar: React.FC<ArtifactToolbarProps> = memo(
  ({ artifact, showSource = false, onToggleSource, onClose }) => {
    const [copied, setCopied] = useState(false);

    // 获取渲染器信息
    const entry = artifactRegistry.get(artifact.type);

    /**
     * 复制内容到剪贴板
     * @requirements 13.1
     */
    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(artifact.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("复制内容失败:", err);
      }
    }, [artifact.content]);

    /**
     * 下载文件
     * @requirements 13.2
     */
    const handleDownload = useCallback(() => {
      const filename = generateFilename(artifact);
      const mimeType = getMimeType(artifact.type);
      const blob = new Blob([artifact.content], { type: mimeType });
      downloadBlob(blob, filename);
    }, [artifact]);

    /**
     * 在新窗口中打开
     * @requirements 13.4
     */
    const handleOpenInWindow = useCallback(() => {
      const win = window.open("", "_blank");
      if (win) {
        // 根据类型决定如何显示内容
        if (artifact.type === "html") {
          // HTML 直接渲染
          win.document.write(artifact.content);
        } else if (artifact.type === "svg") {
          // SVG 直接渲染
          win.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${escapeHtml(artifact.title)}</title>
                <style>
                  body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a1a; }
                  svg { max-width: 100%; max-height: 100vh; }
                </style>
              </head>
              <body>${artifact.content}</body>
            </html>
          `);
        } else {
          // 其他类型显示为预格式化文本
          win.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${escapeHtml(artifact.title)}</title>
                <style>
                  body { margin: 0; padding: 16px; background: #1e1e1e; color: #d4d4d4; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
                  pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; font-size: 13px; line-height: 1.6; }
                </style>
              </head>
              <body><pre>${escapeHtml(artifact.content)}</pre></body>
            </html>
          `);
        }
        win.document.close();
      }
    }, [artifact]);

    /**
     * 切换源码视图
     * @requirements 13.3
     */
    const handleToggleSource = useCallback(() => {
      onToggleSource?.();
    }, [onToggleSource]);

    /**
     * 关闭面板
     * @requirements 13.5
     */
    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    // 判断是否支持源码切换（非代码类型才需要切换）
    const supportsSourceToggle = artifact.type !== "code" && onToggleSource;

    return (
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-white/10 bg-[#21252b]">
        {/* 标题区域 */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {/* 类型图标 */}
          {entry && (
            <span className="text-gray-400 text-xs shrink-0">
              {entry.displayName}
            </span>
          )}
          {/* 标题 */}
          <span className="text-sm font-medium text-white truncate">
            {artifact.title}
          </span>
        </div>

        {/* 操作按钮区域 */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* 复制按钮 */}
          <ToolbarButton
            onClick={handleCopy}
            title={copied ? "已复制" : "复制内容"}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </ToolbarButton>

          {/* 下载按钮 */}
          <ToolbarButton onClick={handleDownload} title="下载文件">
            <Download className="w-4 h-4" />
          </ToolbarButton>

          {/* 源码切换按钮 */}
          {supportsSourceToggle && (
            <ToolbarButton
              onClick={handleToggleSource}
              title={showSource ? "显示预览" : "显示源码"}
              active={showSource}
            >
              {showSource ? (
                <Eye className="w-4 h-4" />
              ) : (
                <Code className="w-4 h-4" />
              )}
            </ToolbarButton>
          )}

          {/* 新窗口打开按钮 */}
          <ToolbarButton onClick={handleOpenInWindow} title="在新窗口中打开">
            <ExternalLink className="w-4 h-4" />
          </ToolbarButton>

          {/* 关闭按钮 */}
          {onClose && (
            <ToolbarButton onClick={handleClose} title="关闭">
              <X className="w-4 h-4" />
            </ToolbarButton>
          )}
        </div>
      </div>
    );
  },
);

ArtifactToolbar.displayName = "ArtifactToolbar";

/**
 * 根据 Artifact 类型获取 MIME 类型
 * @param type - Artifact 类型
 * @returns MIME 类型
 */
function getMimeType(type: Artifact["type"]): string {
  const mimeTypes: Record<string, string> = {
    code: "text/plain",
    html: "text/html",
    svg: "image/svg+xml",
    mermaid: "text/plain",
    react: "text/javascript",
    "canvas:document": "text/markdown",
    "canvas:poster": "application/json",
    "canvas:music": "application/json",
    "canvas:script": "application/json",
    "canvas:novel": "application/json",
  };

  return mimeTypes[type] || "text/plain";
}

export default ArtifactToolbar;
