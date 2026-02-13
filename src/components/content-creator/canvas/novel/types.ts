/**
 * 小说画布类型定义
 */

/** 章节 */
export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  wordCount: number;
  status: "draft" | "completed";
  createdAt: number;
  updatedAt: number;
}

/** 大纲节点 */
export interface OutlineNode {
  id: string;
  title: string;
  content?: string;
  children: OutlineNode[];
  expanded: boolean;
}

/** 小说画布状态 */
export interface NovelCanvasState {
  type: "novel";
  chapters: Chapter[];
  currentChapterId: string;
  outline: OutlineNode[];
  title?: string;
  synopsis?: string;
}

/** 计算字数 */
export function countWords(text: string): number {
  // 简单的中文字数统计
  return text.replace(/\s/g, "").length;
}

function sanitizeNovelContent(raw: string): string {
  if (!raw) return "";

  let text = raw;

  // 过滤 A2UI 标签块
  text = text.replace(/<a2ui>[\s\S]*?<\/a2ui>/gi, "");

  // 过滤常见 A2UI fenced code block
  text = text.replace(/```a2ui[\s\S]*?```/gi, "");

  // 过滤包含 A2UI 特征字段的 JSON code block
  text = text.replace(/```json\s*([\s\S]*?)```/gi, (block, inner) => {
    const normalized = String(inner).toLowerCase();
    const looksLikeA2UI =
      normalized.includes('"components"') &&
      (normalized.includes('"type":"form"') ||
        normalized.includes('"submitaction"') ||
        normalized.includes('"root"'));

    return looksLikeA2UI ? "" : block;
  });

  // 过滤误写入正文的章节序列化 JSON（历史数据兼容）
  const jsonCandidate = text.match(/^```json\s*([\s\S]*?)```$/i)?.[1] || text;
  try {
    const parsed = JSON.parse(jsonCandidate) as unknown;
    if (Array.isArray(parsed)) {
      const looksLikeChapterList = parsed.some(
        (item) => item && typeof item === "object" && "title" in item,
      );
      if (looksLikeChapterList) {
        const merged = parsed
          .map((item) => {
            if (!item || typeof item !== "object") return "";
            const chapter = item as { content?: unknown };
            return typeof chapter.content === "string" ? chapter.content : "";
          })
          .filter(Boolean)
          .join("\n\n")
          .trim();

        text = merged;
      }
    }
  } catch {
    // 非 JSON，忽略
  }

  return text.trim();
}

function normalizeChapter(raw: Partial<Chapter>, index: number): Chapter {
  const now = Date.now();
  const chapterContent = sanitizeNovelContent(raw.content ?? "");

  return {
    id: raw.id || crypto.randomUUID(),
    number:
      typeof raw.number === "number" && raw.number > 0 ? raw.number : index + 1,
    title:
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title.trim()
        : `第${index + 1}章`,
    content: chapterContent,
    wordCount: countWords(chapterContent),
    status: raw.status === "completed" ? "completed" : "draft",
    createdAt:
      typeof raw.createdAt === "number" && Number.isFinite(raw.createdAt)
        ? raw.createdAt
        : now,
    updatedAt:
      typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt)
        ? raw.updatedAt
        : now,
  };
}

function tryParseSerializedChapters(content: string): Chapter[] | null {
  const trimmed = content.trim();
  if (!trimmed) return null;

  const jsonCandidate =
    trimmed.match(/^```json\s*([\s\S]*?)```$/i)?.[1] || trimmed;

  try {
    const parsed = JSON.parse(jsonCandidate);

    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => normalizeChapter(item || {}, index));
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { chapters?: unknown[] }).chapters)
    ) {
      const chapters = (parsed as { chapters: unknown[] }).chapters;
      return chapters.map((item, index) =>
        normalizeChapter((item as Partial<Chapter>) || {}, index),
      );
    }

    return null;
  } catch {
    return null;
  }
}

/** 创建初始小说状态 */
export function createInitialNovelState(content?: string): NovelCanvasState {
  const rawContent = content ?? "";

  const parsedChapters = tryParseSerializedChapters(rawContent);
  if (parsedChapters && parsedChapters.length > 0) {
    return {
      type: "novel",
      chapters: parsedChapters,
      currentChapterId: parsedChapters[0].id,
      outline: [],
    };
  }

  const sanitizedContent = sanitizeNovelContent(rawContent);
  const now = Date.now();
  const defaultChapter: Chapter = {
    id: crypto.randomUUID(),
    number: 1,
    title: "第一章",
    content: sanitizedContent,
    wordCount: countWords(sanitizedContent),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  return {
    type: "novel",
    chapters: [defaultChapter],
    currentChapterId: defaultChapter.id,
    outline: [],
  };
}

/** 将小说状态转换为文本 */
export function novelStateToText(state: NovelCanvasState): string {
  let text = "";

  if (state.title) {
    text += `# ${state.title}\n\n`;
  }

  if (state.synopsis) {
    text += `> ${state.synopsis}\n\n`;
  }

  for (const chapter of state.chapters) {
    text += `## ${chapter.title}\n\n`;
    text += `${chapter.content}\n\n`;
  }

  return text;
}
