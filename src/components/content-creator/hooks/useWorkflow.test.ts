/**
 * @file useWorkflow 步骤定义测试
 * @description 测试工作流步骤定义与文件映射的一致性
 * @module components/content-creator/hooks/useWorkflow.test
 */

import { describe, it, expect } from "vitest";
import { getWorkflowSteps } from "./useWorkflow";
import { getFileToStepMap } from "@/components/agent/chat/utils/workflowMapping";
import type { ThemeType, CreationMode } from "../types";

// ============================================================================
// getWorkflowSteps 基本功能测试
// ============================================================================

describe("getWorkflowSteps", () => {
  describe("social-media 主题", () => {
    it("guided 模式应该返回 4 个步骤", () => {
      const steps = getWorkflowSteps("social-media", "guided");
      expect(steps.length).toBe(4);
    });

    it("fast 模式应该返回 3 个步骤", () => {
      const steps = getWorkflowSteps("social-media", "fast");
      expect(steps.length).toBe(3);
    });

    it("guided 模式应该有正确的步骤 ID", () => {
      const steps = getWorkflowSteps("social-media", "guided");
      const stepIds = steps.map((s) => s.id);
      expect(stepIds).toEqual(["brief", "create", "polish", "adapt"]);
    });

    it("fast 模式应该有正确的步骤 ID", () => {
      const steps = getWorkflowSteps("social-media", "fast");
      const stepIds = steps.map((s) => s.id);
      expect(stepIds).toEqual(["brief", "create", "adapt"]);
    });
  });

  describe("video 主题", () => {
    it("guided 模式应该返回 5 个步骤", () => {
      const steps = getWorkflowSteps("video", "guided");
      expect(steps.length).toBe(5);
    });

    it("fast 模式应该返回 3 个步骤", () => {
      const steps = getWorkflowSteps("video", "fast");
      expect(steps.length).toBe(3);
    });

    it("guided 模式应该有正确的步骤 ID", () => {
      const steps = getWorkflowSteps("video", "guided");
      const stepIds = steps.map((s) => s.id);
      expect(stepIds).toEqual([
        "brief",
        "outline",
        "storyboard",
        "script",
        "polish",
      ]);
    });

    it("fast 模式应该有正确的步骤 ID", () => {
      const steps = getWorkflowSteps("video", "fast");
      const stepIds = steps.map((s) => s.id);
      expect(stepIds).toEqual(["brief", "script", "polish"]);
    });
  });

  describe("novel 主题", () => {
    it("guided 模式应该返回 5 个步骤", () => {
      const steps = getWorkflowSteps("novel", "guided");
      expect(steps.length).toBe(5);
    });

    it("fast 模式应该返回 3 个步骤", () => {
      const steps = getWorkflowSteps("novel", "fast");
      expect(steps.length).toBe(3);
    });

    it("guided 模式应该有正确的步骤 ID", () => {
      const steps = getWorkflowSteps("novel", "guided");
      const stepIds = steps.map((s) => s.id);
      expect(stepIds).toEqual([
        "brief",
        "outline",
        "character",
        "write",
        "polish",
      ]);
    });
  });

  describe("document 主题", () => {
    it("guided 模式应该返回 4 个步骤", () => {
      const steps = getWorkflowSteps("document", "guided");
      expect(steps.length).toBe(4);
    });

    it("fast 模式应该返回 3 个步骤", () => {
      const steps = getWorkflowSteps("document", "fast");
      expect(steps.length).toBe(3);
    });

    it("guided 模式应该有正确的步骤 ID", () => {
      const steps = getWorkflowSteps("document", "guided");
      const stepIds = steps.map((s) => s.id);
      expect(stepIds).toEqual(["brief", "outline", "write", "polish"]);
    });
  });

  describe("music 主题", () => {
    it("guided 模式应该返回 7 个步骤", () => {
      const steps = getWorkflowSteps("music", "guided");
      expect(steps.length).toBe(7);
    });

    it("fast 模式应该返回 3 个步骤", () => {
      const steps = getWorkflowSteps("music", "fast");
      expect(steps.length).toBe(3);
    });

    it("guided 模式应该有正确的步骤 ID", () => {
      const steps = getWorkflowSteps("music", "guided");
      const stepIds = steps.map((s) => s.id);
      expect(stepIds).toEqual([
        "spec",
        "theme",
        "mood",
        "structure",
        "lyrics",
        "polish",
        "export",
      ]);
    });

    it("fast 模式应该有正确的步骤 ID", () => {
      const steps = getWorkflowSteps("music", "fast");
      const stepIds = steps.map((s) => s.id);
      expect(stepIds).toEqual(["spec", "lyrics", "export"]);
    });
  });

  describe("poster 主题", () => {
    it("guided 模式应该返回 5 个步骤", () => {
      const steps = getWorkflowSteps("poster", "guided");
      expect(steps.length).toBe(5);
    });

    it("fast 模式应该返回 3 个步骤", () => {
      const steps = getWorkflowSteps("poster", "fast");
      expect(steps.length).toBe(3);
    });

    it("guided 模式应该有正确的步骤 ID", () => {
      const steps = getWorkflowSteps("poster", "guided");
      const stepIds = steps.map((s) => s.id);
      expect(stepIds).toEqual([
        "brief",
        "copywriting",
        "layout",
        "design",
        "export",
      ]);
    });
  });

  describe("无工作流的主题", () => {
    it("general 应该返回空数组", () => {
      const steps = getWorkflowSteps("general", "guided");
      expect(steps.length).toBe(0);
    });

    it("knowledge 应该返回空数组", () => {
      const steps = getWorkflowSteps("knowledge", "guided");
      expect(steps.length).toBe(0);
    });

    it("planning 应该返回空数组", () => {
      const steps = getWorkflowSteps("planning", "guided");
      expect(steps.length).toBe(0);
    });
  });
});

// ============================================================================
// 步骤定义与文件映射一致性测试
// ============================================================================

describe("getWorkflowSteps 与 getFileToStepMap 一致性", () => {
  const themesWithWorkflow: ThemeType[] = [
    "social-media",
    "video",
    "novel",
    "document",
    "music",
    "poster",
  ];

  const modes: CreationMode[] = ["guided", "fast"];

  describe("文件映射索引不超过步骤数量", () => {
    themesWithWorkflow.forEach((theme) => {
      modes.forEach((mode) => {
        it(`${theme} (${mode}) 的文件映射最大索引应该 < 步骤数量`, () => {
          const steps = getWorkflowSteps(theme, mode);
          const fileMap = getFileToStepMap(theme);
          const maxFileIndex = Math.max(...Object.values(fileMap), -1);

          // 文件映射的最大索引应该小于步骤数量
          // 注意：快速模式可能有更少的步骤，但文件映射是通用的
          // 所以我们只在 guided 模式下检查
          if (mode === "guided" && steps.length > 0) {
            expect(maxFileIndex).toBeLessThan(steps.length);
          }
        });
      });
    });
  });

  describe("无工作流主题的一致性", () => {
    const themesWithoutWorkflow: ThemeType[] = [
      "general",
      "knowledge",
      "planning",
    ];

    themesWithoutWorkflow.forEach((theme) => {
      it(`${theme} 步骤和文件映射都应该为空`, () => {
        const steps = getWorkflowSteps(theme, "guided");
        const fileMap = getFileToStepMap(theme);

        expect(steps.length).toBe(0);
        expect(Object.keys(fileMap).length).toBe(0);
      });
    });
  });
});

// ============================================================================
// 步骤属性测试
// ============================================================================

describe("步骤属性", () => {
  describe("第一步应该不可跳过", () => {
    const themesWithWorkflow: ThemeType[] = [
      "social-media",
      "video",
      "novel",
      "document",
      "music",
      "poster",
    ];

    themesWithWorkflow.forEach((theme) => {
      it(`${theme} 的第一步应该不可跳过`, () => {
        const steps = getWorkflowSteps(theme, "guided");
        if (steps.length > 0) {
          expect(steps[0].behavior.skippable).toBe(false);
        }
      });
    });
  });

  describe("所有步骤应该有必要的属性", () => {
    const themesWithWorkflow: ThemeType[] = [
      "social-media",
      "video",
      "novel",
      "document",
      "music",
      "poster",
    ];

    themesWithWorkflow.forEach((theme) => {
      it(`${theme} 的所有步骤应该有 id, type, title, behavior`, () => {
        const steps = getWorkflowSteps(theme, "guided");
        steps.forEach((step) => {
          expect(step.id).toBeDefined();
          expect(step.type).toBeDefined();
          expect(step.title).toBeDefined();
          expect(step.behavior).toBeDefined();
          expect(step.behavior.skippable).toBeDefined();
          expect(step.behavior.redoable).toBeDefined();
          expect(step.behavior.autoAdvance).toBeDefined();
        });
      });
    });
  });

  describe("步骤 ID 应该唯一", () => {
    const themesWithWorkflow: ThemeType[] = [
      "social-media",
      "video",
      "novel",
      "document",
      "music",
      "poster",
    ];

    themesWithWorkflow.forEach((theme) => {
      it(`${theme} 的步骤 ID 应该唯一`, () => {
        const steps = getWorkflowSteps(theme, "guided");
        const ids = steps.map((s) => s.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });
    });
  });
});

// ============================================================================
// 覆盖所有主题类型测试
// ============================================================================

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
      expect(() => getWorkflowSteps(theme, "guided")).not.toThrow();
      expect(() => getWorkflowSteps(theme, "fast")).not.toThrow();
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
      (theme) => getWorkflowSteps(theme, "guided").length > 0,
    );
    expect(themesWithWorkflow.length).toBe(6);
  });
});
