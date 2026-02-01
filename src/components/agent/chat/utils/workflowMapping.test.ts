/**
 * @file 工作流文件映射测试
 * @description 测试 getFileToStepMap 及相关工具函数
 * @module components/agent/chat/utils/workflowMapping.test
 */

import { describe, it, expect } from "vitest";
import {
  getFileToStepMap,
  getSupportedFilenames,
  isWorkflowFile,
  getStepIndexForFile,
} from "./workflowMapping";
import type { ThemeType } from "@/components/content-creator/types";

// ============================================================================
// getFileToStepMap 测试
// ============================================================================

describe("getFileToStepMap", () => {
  describe("social-media 主题", () => {
    it("应该返回正确的文件映射", () => {
      const map = getFileToStepMap("social-media");
      expect(map["brief.md"]).toBe(0);
      expect(map["draft.md"]).toBe(1);
      expect(map["article.md"]).toBe(2);
      expect(map["adapted.md"]).toBe(3);
    });

    it("应该包含 4 个文件映射", () => {
      const map = getFileToStepMap("social-media");
      expect(Object.keys(map).length).toBe(4);
    });
  });

  describe("video 主题", () => {
    it("应该返回正确的文件映射", () => {
      const map = getFileToStepMap("video");
      expect(map["brief.md"]).toBe(0);
      expect(map["outline.md"]).toBe(1);
      expect(map["storyboard.md"]).toBe(2);
      expect(map["script.md"]).toBe(3);
      expect(map["script-final.md"]).toBe(4);
    });

    it("应该包含 5 个文件映射", () => {
      const map = getFileToStepMap("video");
      expect(Object.keys(map).length).toBe(5);
    });
  });

  describe("novel 主题", () => {
    it("应该返回正确的文件映射", () => {
      const map = getFileToStepMap("novel");
      expect(map["brief.md"]).toBe(0);
      expect(map["outline.md"]).toBe(1);
      expect(map["characters.md"]).toBe(2);
      expect(map["chapter.md"]).toBe(3);
      expect(map["chapter-final.md"]).toBe(4);
    });

    it("应该包含 5 个文件映射", () => {
      const map = getFileToStepMap("novel");
      expect(Object.keys(map).length).toBe(5);
    });
  });

  describe("document 主题", () => {
    it("应该返回正确的文件映射", () => {
      const map = getFileToStepMap("document");
      expect(map["brief.md"]).toBe(0);
      expect(map["outline.md"]).toBe(1);
      expect(map["draft.md"]).toBe(2);
      expect(map["article.md"]).toBe(3);
    });

    it("应该包含 4 个文件映射", () => {
      const map = getFileToStepMap("document");
      expect(Object.keys(map).length).toBe(4);
    });
  });

  describe("music 主题", () => {
    it("应该返回正确的文件映射", () => {
      const map = getFileToStepMap("music");
      expect(map["song-spec.md"]).toBe(0);
      expect(map["lyrics-draft.md"]).toBe(1);
      expect(map["lyrics-final.txt"]).toBe(2);
    });

    it("应该包含 3 个文件映射", () => {
      const map = getFileToStepMap("music");
      expect(Object.keys(map).length).toBe(3);
    });
  });

  describe("poster 主题", () => {
    it("应该返回正确的文件映射", () => {
      const map = getFileToStepMap("poster");
      expect(map["brief.md"]).toBe(0);
      expect(map["copywriting.md"]).toBe(1);
      expect(map["layout.md"]).toBe(2);
      expect(map["design.md"]).toBe(3);
    });

    it("应该包含 4 个文件映射", () => {
      const map = getFileToStepMap("poster");
      expect(Object.keys(map).length).toBe(4);
    });
  });

  describe("无工作流的主题", () => {
    it("general 应该返回空映射", () => {
      const map = getFileToStepMap("general");
      expect(Object.keys(map).length).toBe(0);
    });

    it("knowledge 应该返回空映射", () => {
      const map = getFileToStepMap("knowledge");
      expect(Object.keys(map).length).toBe(0);
    });

    it("planning 应该返回空映射", () => {
      const map = getFileToStepMap("planning");
      expect(Object.keys(map).length).toBe(0);
    });
  });

  describe("覆盖所有主题类型", () => {
    it("应该覆盖所有 ThemeType", () => {
      const allThemes: ThemeType[] = [
        "general",
        "social-media",
        "poster",
        "music",
        "knowledge",
        "planning",
        "document",
        "video",
        "novel",
      ];

      allThemes.forEach((theme) => {
        // 不应该抛出错误
        expect(() => getFileToStepMap(theme)).not.toThrow();
      });
    });

    it("有工作流的主题数量应该是 6 种", () => {
      const allThemes: ThemeType[] = [
        "general",
        "social-media",
        "poster",
        "music",
        "knowledge",
        "planning",
        "document",
        "video",
        "novel",
      ];

      const themesWithWorkflow = allThemes.filter(
        (theme) => Object.keys(getFileToStepMap(theme)).length > 0,
      );
      expect(themesWithWorkflow.length).toBe(6);
    });
  });

  describe("步骤索引连续性", () => {
    it("social-media 步骤索引应该从 0 开始连续", () => {
      const map = getFileToStepMap("social-media");
      const indices = Object.values(map).sort((a, b) => a - b);
      expect(indices).toEqual([0, 1, 2, 3]);
    });

    it("video 步骤索引应该从 0 开始连续", () => {
      const map = getFileToStepMap("video");
      const indices = Object.values(map).sort((a, b) => a - b);
      expect(indices).toEqual([0, 1, 2, 3, 4]);
    });

    it("novel 步骤索引应该从 0 开始连续", () => {
      const map = getFileToStepMap("novel");
      const indices = Object.values(map).sort((a, b) => a - b);
      expect(indices).toEqual([0, 1, 2, 3, 4]);
    });

    it("document 步骤索引应该从 0 开始连续", () => {
      const map = getFileToStepMap("document");
      const indices = Object.values(map).sort((a, b) => a - b);
      expect(indices).toEqual([0, 1, 2, 3]);
    });

    it("music 步骤索引应该从 0 开始连续", () => {
      const map = getFileToStepMap("music");
      const indices = Object.values(map).sort((a, b) => a - b);
      expect(indices).toEqual([0, 1, 2]);
    });

    it("poster 步骤索引应该从 0 开始连续", () => {
      const map = getFileToStepMap("poster");
      const indices = Object.values(map).sort((a, b) => a - b);
      expect(indices).toEqual([0, 1, 2, 3]);
    });
  });
});

// ============================================================================
// getSupportedFilenames 测试
// ============================================================================

describe("getSupportedFilenames", () => {
  it("应该返回 social-media 支持的所有文件名", () => {
    const filenames = getSupportedFilenames("social-media");
    expect(filenames).toContain("brief.md");
    expect(filenames).toContain("draft.md");
    expect(filenames).toContain("article.md");
    expect(filenames).toContain("adapted.md");
    expect(filenames.length).toBe(4);
  });

  it("应该返回 video 支持的所有文件名", () => {
    const filenames = getSupportedFilenames("video");
    expect(filenames).toContain("brief.md");
    expect(filenames).toContain("outline.md");
    expect(filenames).toContain("storyboard.md");
    expect(filenames).toContain("script.md");
    expect(filenames).toContain("script-final.md");
    expect(filenames.length).toBe(5);
  });

  it("无工作流的主题应该返回空数组", () => {
    expect(getSupportedFilenames("general")).toEqual([]);
    expect(getSupportedFilenames("knowledge")).toEqual([]);
    expect(getSupportedFilenames("planning")).toEqual([]);
  });
});

// ============================================================================
// isWorkflowFile 测试
// ============================================================================

describe("isWorkflowFile", () => {
  it("应该正确识别 social-media 的工作流文件", () => {
    expect(isWorkflowFile("social-media", "brief.md")).toBe(true);
    expect(isWorkflowFile("social-media", "draft.md")).toBe(true);
    expect(isWorkflowFile("social-media", "article.md")).toBe(true);
    expect(isWorkflowFile("social-media", "adapted.md")).toBe(true);
    expect(isWorkflowFile("social-media", "unknown.md")).toBe(false);
  });

  it("应该正确识别 video 的工作流文件", () => {
    expect(isWorkflowFile("video", "brief.md")).toBe(true);
    expect(isWorkflowFile("video", "script.md")).toBe(true);
    expect(isWorkflowFile("video", "lyrics.md")).toBe(false);
  });

  it("应该正确识别 music 的工作流文件", () => {
    expect(isWorkflowFile("music", "song-spec.md")).toBe(true);
    expect(isWorkflowFile("music", "lyrics-draft.md")).toBe(true);
    expect(isWorkflowFile("music", "lyrics-final.txt")).toBe(true);
    expect(isWorkflowFile("music", "brief.md")).toBe(false);
  });

  it("无工作流的主题应该对所有文件返回 false", () => {
    expect(isWorkflowFile("general", "brief.md")).toBe(false);
    expect(isWorkflowFile("general", "any-file.md")).toBe(false);
    expect(isWorkflowFile("knowledge", "brief.md")).toBe(false);
    expect(isWorkflowFile("planning", "brief.md")).toBe(false);
  });
});

// ============================================================================
// getStepIndexForFile 测试
// ============================================================================

describe("getStepIndexForFile", () => {
  it("应该返回正确的步骤索引", () => {
    expect(getStepIndexForFile("social-media", "brief.md")).toBe(0);
    expect(getStepIndexForFile("social-media", "draft.md")).toBe(1);
    expect(getStepIndexForFile("video", "script.md")).toBe(3);
    expect(getStepIndexForFile("music", "lyrics-final.txt")).toBe(2);
  });

  it("不存在的文件应该返回 undefined", () => {
    expect(getStepIndexForFile("social-media", "unknown.md")).toBeUndefined();
    expect(getStepIndexForFile("video", "lyrics.md")).toBeUndefined();
  });

  it("无工作流的主题应该返回 undefined", () => {
    expect(getStepIndexForFile("general", "brief.md")).toBeUndefined();
    expect(getStepIndexForFile("knowledge", "any.md")).toBeUndefined();
  });
});

// ============================================================================
// 跨主题文件名冲突测试
// ============================================================================

describe("跨主题文件名", () => {
  it("brief.md 在不同主题中都应该是步骤 0", () => {
    // brief.md 是多个主题的第一步
    expect(getStepIndexForFile("social-media", "brief.md")).toBe(0);
    expect(getStepIndexForFile("video", "brief.md")).toBe(0);
    expect(getStepIndexForFile("novel", "brief.md")).toBe(0);
    expect(getStepIndexForFile("document", "brief.md")).toBe(0);
    expect(getStepIndexForFile("poster", "brief.md")).toBe(0);
    // music 使用不同的第一步文件名
    expect(getStepIndexForFile("music", "brief.md")).toBeUndefined();
  });

  it("draft.md 在不同主题中可能有不同的步骤索引", () => {
    expect(getStepIndexForFile("social-media", "draft.md")).toBe(1);
    expect(getStepIndexForFile("document", "draft.md")).toBe(2);
    // video 和 novel 不使用 draft.md
    expect(getStepIndexForFile("video", "draft.md")).toBeUndefined();
    expect(getStepIndexForFile("novel", "draft.md")).toBeUndefined();
  });

  it("outline.md 在不同主题中可能有不同的步骤索引", () => {
    expect(getStepIndexForFile("video", "outline.md")).toBe(1);
    expect(getStepIndexForFile("novel", "outline.md")).toBe(1);
    expect(getStepIndexForFile("document", "outline.md")).toBe(1);
    // social-media 不使用 outline.md
    expect(getStepIndexForFile("social-media", "outline.md")).toBeUndefined();
  });
});
