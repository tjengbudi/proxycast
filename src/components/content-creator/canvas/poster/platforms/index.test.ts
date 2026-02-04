/**
 * @file 平台规范测试
 * @description 测试多平台导出规范的正确性
 * @module components/content-creator/canvas/poster/platforms/index.test
 */

import { describe, it, expect } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import {
  allPlatformSpecs,
  getPlatformSpec,
  getRecommendedSize,
  checkFileCompliance,
  xiaohongshuSpec,
  wechatSpec,
  taobaoSpec,
  douyinSpec,
} from "./index";
import type { PlatformId } from "./types";

/**
 * PlatformId 生成器
 */
const platformIdArb = fc.constantFrom<PlatformId>(
  "xiaohongshu",
  "wechat",
  "taobao",
  "douyin",
);

/**
 * 文件大小生成器 (KB)
 */
const fileSizeArb = fc.integer({ min: 1, max: 50000 });

/**
 * 文件格式生成器
 */
const fileFormatArb = fc.constantFrom("jpg", "png", "gif", "webp", "svg");

describe("平台规范属性测试", () => {
  /**
   * Property: 所有平台规范应该有有效的尺寸列表
   */
  test.prop([platformIdArb])("每个平台应该至少有一个尺寸规格", (platformId) => {
    const spec = getPlatformSpec(platformId);
    expect(spec).toBeDefined();
    expect(spec!.sizes.length).toBeGreaterThan(0);
  });

  /**
   * Property: 所有尺寸规格应该有正数的宽高
   */
  test.prop([platformIdArb])("所有尺寸规格的宽高应该是正数", (platformId) => {
    const spec = getPlatformSpec(platformId);
    spec!.sizes.forEach((size) => {
      expect(size.width).toBeGreaterThan(0);
      // 高度可以是 0（表示不限制，如淘宝详情页长图）
      expect(size.height).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * Property: 文件合规性检查应该正确处理边界情况
   */
  test.prop([platformIdArb, fileSizeArb, fileFormatArb])(
    "文件合规性检查应该返回有效结果",
    (platformId, fileSize, format) => {
      const result = checkFileCompliance(platformId, fileSize, format);

      expect(typeof result.valid).toBe("boolean");
      expect(Array.isArray(result.errors)).toBe(true);

      // 如果有效，错误列表应该为空
      if (result.valid) {
        expect(result.errors).toHaveLength(0);
      }
    },
  );

  /**
   * Property: 推荐尺寸应该存在于平台的尺寸列表中
   */
  test.prop([platformIdArb])(
    "推荐尺寸应该是平台尺寸列表中的一个",
    (platformId) => {
      const recommendedSize = getRecommendedSize(platformId);
      const spec = getPlatformSpec(platformId);

      expect(recommendedSize).toBeDefined();
      expect(spec!.sizes).toContainEqual(recommendedSize);
    },
  );
});

describe("平台规范单元测试", () => {
  describe("allPlatformSpecs", () => {
    it("应该包含 4 个平台规范", () => {
      expect(allPlatformSpecs).toHaveLength(4);
    });

    it("每个平台规范应该有必要字段", () => {
      allPlatformSpecs.forEach((spec) => {
        expect(spec.id).toBeDefined();
        expect(spec.name).toBeDefined();
        expect(spec.description).toBeDefined();
        expect(spec.sizes).toBeDefined();
        expect(spec.fileSpec).toBeDefined();
      });
    });
  });

  describe("xiaohongshuSpec", () => {
    it("应该有正确的 ID 和名称", () => {
      expect(xiaohongshuSpec.id).toBe("xiaohongshu");
      expect(xiaohongshuSpec.name).toBe("小红书");
    });

    it("应该有推荐的 3:4 尺寸", () => {
      const recommended = xiaohongshuSpec.sizes.find((s) => s.recommended);
      expect(recommended).toBeDefined();
      expect(recommended!.aspectRatio).toBe("3:4");
      expect(recommended!.width).toBe(1080);
      expect(recommended!.height).toBe(1440);
    });

    it("应该有安全区域定义", () => {
      expect(xiaohongshuSpec.safeZone).toBeDefined();
      expect(xiaohongshuSpec.safeZone!.top).toBeGreaterThan(0);
      expect(xiaohongshuSpec.safeZone!.bottom).toBeGreaterThan(0);
    });
  });

  describe("wechatSpec", () => {
    it("应该有正确的 ID 和名称", () => {
      expect(wechatSpec.id).toBe("wechat");
      expect(wechatSpec.name).toBe("微信");
    });

    it("应该支持公众号封面尺寸", () => {
      const coverSize = wechatSpec.sizes.find((s) =>
        s.name.includes("公众号封面"),
      );
      expect(coverSize).toBeDefined();
      expect(coverSize!.aspectRatio).toBe("2.35:1");
    });
  });

  describe("taobaoSpec", () => {
    it("应该有正确的 ID 和名称", () => {
      expect(taobaoSpec.id).toBe("taobao");
      expect(taobaoSpec.name).toBe("淘宝");
    });

    it("应该有商品主图尺寸", () => {
      const mainImage = taobaoSpec.sizes.find((s) =>
        s.name.includes("商品主图"),
      );
      expect(mainImage).toBeDefined();
      expect(mainImage!.aspectRatio).toBe("1:1");
    });

    it("文件大小限制应该是 3MB", () => {
      expect(taobaoSpec.fileSpec.maxSizeKB).toBe(3072);
    });
  });

  describe("douyinSpec", () => {
    it("应该有正确的 ID 和名称", () => {
      expect(douyinSpec.id).toBe("douyin");
      expect(douyinSpec.name).toBe("抖音");
    });

    it("应该有 9:16 竖版视频封面", () => {
      const verticalCover = douyinSpec.sizes.find(
        (s) => s.aspectRatio === "9:16" && s.recommended,
      );
      expect(verticalCover).toBeDefined();
      expect(verticalCover!.width).toBe(1080);
      expect(verticalCover!.height).toBe(1920);
    });
  });

  describe("getPlatformSpec", () => {
    it("应该返回正确的平台规范", () => {
      expect(getPlatformSpec("xiaohongshu")).toBe(xiaohongshuSpec);
      expect(getPlatformSpec("wechat")).toBe(wechatSpec);
      expect(getPlatformSpec("taobao")).toBe(taobaoSpec);
      expect(getPlatformSpec("douyin")).toBe(douyinSpec);
    });

    it("应该对未知平台返回 undefined", () => {
      expect(getPlatformSpec("unknown" as PlatformId)).toBeUndefined();
    });
  });

  describe("getRecommendedSize", () => {
    it("应该返回标记为推荐的尺寸", () => {
      const size = getRecommendedSize("xiaohongshu");
      expect(size).toBeDefined();
      expect(size!.recommended).toBe(true);
    });

    it("如果没有推荐尺寸，应该返回第一个尺寸", () => {
      // 所有平台都有推荐尺寸，这里测试逻辑
      const size = getRecommendedSize("wechat");
      expect(size).toBeDefined();
    });
  });

  describe("checkFileCompliance", () => {
    it("应该通过有效的文件", () => {
      const result = checkFileCompliance("xiaohongshu", 1000, "png");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("应该拒绝过大的文件", () => {
      const result = checkFileCompliance("taobao", 5000, "png"); // 5MB > 3MB
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("文件大小");
    });

    it("应该拒绝不支持的格式", () => {
      const result = checkFileCompliance("taobao", 1000, "svg");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("格式");
    });

    it("应该对未知平台返回错误", () => {
      const result = checkFileCompliance("unknown" as PlatformId, 1000, "png");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("未知平台");
    });
  });
});
