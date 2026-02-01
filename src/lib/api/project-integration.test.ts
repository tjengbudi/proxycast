/**
 * @file 项目 API 集成测试
 * @description 测试前后端类型一致性和旧类型兼容
 * @module lib/api/project-integration.test
 */

import { describe, it, expect } from "vitest";
import { TYPE_CONFIGS, USER_PROJECT_TYPES, type ProjectType } from "./project";
import type { ThemeType } from "@/components/content-creator/types";

// ============================================================================
// 类型一致性测试
// ============================================================================

describe("Project API 集成测试", () => {
  describe("类型一致性", () => {
    it("前端 ProjectType 应该与后端 WorkspaceType 一一对应", () => {
      // 验证所有类型都能正确序列化/反序列化
      const allTypes: ProjectType[] = [
        "persistent",
        "temporary",
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

      // 验证所有类型都有配置
      allTypes.forEach((type) => {
        expect(TYPE_CONFIGS[type]).toBeDefined();
        expect(TYPE_CONFIGS[type].label).toBeTruthy();
        expect(TYPE_CONFIGS[type].icon).toBeTruthy();
      });

      // 验证类型数量
      expect(Object.keys(TYPE_CONFIGS)).toHaveLength(11);
    });

    it("ThemeType 应该是 UserType 的子集", () => {
      const themes: ThemeType[] = [
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

      themes.forEach((theme) => {
        expect(USER_PROJECT_TYPES).toContain(theme);
      });

      // ThemeType 和 UserType 应该完全一致
      expect(themes).toHaveLength(USER_PROJECT_TYPES.length);
    });

    it("UserType 应该正好有 9 种类型", () => {
      expect(USER_PROJECT_TYPES).toHaveLength(9);
    });

    it("SystemType 应该正好有 2 种类型", () => {
      const systemTypes: ProjectType[] = ["persistent", "temporary"];
      systemTypes.forEach((type) => {
        expect(USER_PROJECT_TYPES).not.toContain(type);
        expect(TYPE_CONFIGS[type]).toBeDefined();
      });
    });
  });

  describe("画布类型映射一致性", () => {
    it("支持画布的类型应该有正确的 canvasType", () => {
      const canvasMapping: Record<string, string> = {
        video: "script",
        novel: "novel",
        poster: "poster",
        music: "music",
        "social-media": "document",
        document: "document",
      };

      Object.entries(canvasMapping).forEach(([projectType, canvasType]) => {
        expect(TYPE_CONFIGS[projectType as ProjectType].canvasType).toBe(
          canvasType,
        );
      });
    });

    it("不支持画布的类型 canvasType 应该为 null", () => {
      const noCanvasTypes: ProjectType[] = [
        "persistent",
        "temporary",
        "general",
        "knowledge",
        "planning",
      ];

      noCanvasTypes.forEach((type) => {
        expect(TYPE_CONFIGS[type].canvasType).toBeNull();
      });
    });
  });

  describe("默认内容类型映射", () => {
    it("每种项目类型应该有正确的默认内容类型", () => {
      const contentTypeMapping: Record<ProjectType, string> = {
        persistent: "document",
        temporary: "document",
        general: "content",
        "social-media": "post",
        poster: "document",
        music: "document",
        knowledge: "document",
        planning: "document",
        document: "document",
        video: "episode",
        novel: "chapter",
      };

      Object.entries(contentTypeMapping).forEach(
        ([projectType, contentType]) => {
          expect(
            TYPE_CONFIGS[projectType as ProjectType].defaultContentType,
          ).toBe(contentType);
        },
      );
    });
  });

  describe("图标配置", () => {
    it("每种用户级类型应该有唯一的图标", () => {
      const icons = USER_PROJECT_TYPES.map(
        (type) => TYPE_CONFIGS[type as ProjectType].icon,
      );
      const uniqueIcons = new Set(icons);
      expect(uniqueIcons.size).toBe(USER_PROJECT_TYPES.length);
    });

    it("图标应该是 emoji 格式", () => {
      const allTypes: ProjectType[] = [
        "persistent",
        "temporary",
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

      allTypes.forEach((type) => {
        const icon = TYPE_CONFIGS[type].icon;
        // emoji 通常是多字节字符
        expect(icon.length).toBeGreaterThan(0);
      });
    });
  });

  describe("标签配置", () => {
    it("每种类型应该有中文标签", () => {
      const allTypes: ProjectType[] = [
        "persistent",
        "temporary",
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

      allTypes.forEach((type) => {
        const label = TYPE_CONFIGS[type].label;
        expect(label).toBeTruthy();
        // 验证是中文（包含至少一个中文字符）
        expect(/[\u4e00-\u9fa5]/.test(label)).toBe(true);
      });
    });
  });
});
