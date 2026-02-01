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

/** 创建初始小说状态 */
export function createInitialNovelState(content?: string): NovelCanvasState {
  const now = Date.now();
  const defaultChapter: Chapter = {
    id: crypto.randomUUID(),
    number: 1,
    title: "第一章",
    content: content || "",
    wordCount: content ? content.length : 0,
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

/** 计算字数 */
export function countWords(text: string): number {
  // 简单的中文字数统计
  return text.replace(/\s/g, "").length;
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
