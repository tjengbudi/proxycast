/**
 * @file Artifact 占位符工具
 * @description 解析消息中的 artifact fence，替换为占位符
 * @module components/agent/chat/utils/artifactPlaceholder
 */

/**
 * 解析结果
 */
export interface ArtifactPlaceholderResult {
  /** 处理后的文本（artifact 被替换为占位符标记） */
  processedText: string;
  /** 检测到的 artifact 信息 */
  artifacts: ArtifactInfo[];
  /** 是否有未闭合的 artifact */
  hasPending: boolean;
}

/**
 * Artifact 信息
 */
export interface ArtifactInfo {
  id: string;
  type: string;
  title: string;
  language?: string;
  isComplete: boolean;
}

/**
 * 占位符标记格式
 */
export const ARTIFACT_PLACEHOLDER_PREFIX = "[[ARTIFACT:";
export const ARTIFACT_PLACEHOLDER_SUFFIX = "]]";

/**
 * 解析文本中的 artifact fence，返回处理后的文本和 artifact 信息
 *
 * @param text - 原始文本
 * @param isStreaming - 是否正在流式输出
 * @returns 解析结果
 */
export function parseArtifactPlaceholders(
  text: string,
  isStreaming: boolean = false,
): ArtifactPlaceholderResult {
  const artifacts: ArtifactInfo[] = [];
  let processedText = text;
  let hasPending = false;

  // 匹配完整的 artifact fence: ```artifact ... ``` ... ```
  const completeArtifactRegex = /```artifact\s+([^`]*?)```([\s\S]*?)```/g;

  // 匹配未闭合的 artifact fence（流式输出时）
  const pendingArtifactRegex = /```artifact\s+([^`]*?)```([\s\S]*)$/;

  // 先处理完整的 artifact
  let match: RegExpExecArray | null;
  const replacements: Array<{
    start: number;
    end: number;
    placeholder: string;
    info: ArtifactInfo;
  }> = [];

  while ((match = completeArtifactRegex.exec(text)) !== null) {
    const attrString = match[1];
    const info = parseArtifactAttributes(attrString);

    const artifactInfo: ArtifactInfo = {
      id: info.id || crypto.randomUUID(),
      type: info.type || "code",
      title: info.title || "未命名",
      language: info.language,
      isComplete: true,
    };

    artifacts.push(artifactInfo);

    const placeholder = `${ARTIFACT_PLACEHOLDER_PREFIX}${artifactInfo.id}:${artifactInfo.title}${ARTIFACT_PLACEHOLDER_SUFFIX}`;
    replacements.push({
      start: match.index,
      end: match.index + match[0].length,
      placeholder,
      info: artifactInfo,
    });
  }

  // 从后往前替换，避免索引偏移
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { start, end, placeholder } = replacements[i];
    processedText =
      processedText.slice(0, start) + placeholder + processedText.slice(end);
  }

  // 检查是否有未闭合的 artifact（流式输出时）
  if (isStreaming) {
    const pendingMatch = pendingArtifactRegex.exec(processedText);
    if (pendingMatch && !processedText.includes(ARTIFACT_PLACEHOLDER_PREFIX)) {
      // 有未闭合的 artifact
      hasPending = true;
      const attrString = pendingMatch[1];
      const info = parseArtifactAttributes(attrString);

      const artifactInfo: ArtifactInfo = {
        id: info.id || crypto.randomUUID(),
        type: info.type || "code",
        title: info.title || "生成中...",
        language: info.language,
        isComplete: false,
      };

      artifacts.push(artifactInfo);

      // 替换未闭合的 artifact 为占位符
      const placeholder = `${ARTIFACT_PLACEHOLDER_PREFIX}${artifactInfo.id}:${artifactInfo.title}:pending${ARTIFACT_PLACEHOLDER_SUFFIX}`;
      processedText = processedText.slice(0, pendingMatch.index) + placeholder;
    }
  }

  return {
    processedText,
    artifacts,
    hasPending,
  };
}

/**
 * 解析 artifact 属性字符串
 */
function parseArtifactAttributes(attrString: string): {
  id?: string;
  type?: string;
  title?: string;
  language?: string;
} {
  const result: {
    id?: string;
    type?: string;
    title?: string;
    language?: string;
  } = {};

  // 解析 key="value" 格式
  const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(attrString)) !== null) {
    const [, key, value] = match;
    const normalizedKey = key.toLowerCase();

    switch (normalizedKey) {
      case "id":
        result.id = value;
        break;
      case "type":
        result.type = value;
        break;
      case "title":
        result.title = value;
        break;
      case "language":
        result.language = value;
        break;
    }
  }

  return result;
}

/**
 * 检查文本是否包含 artifact 占位符
 */
export function hasArtifactPlaceholder(text: string): boolean {
  return text.includes(ARTIFACT_PLACEHOLDER_PREFIX);
}

/**
 * 从占位符中提取 artifact ID
 */
export function extractArtifactId(placeholder: string): string | null {
  const match = placeholder.match(/\[\[ARTIFACT:([^:]+):/);
  return match ? match[1] : null;
}
