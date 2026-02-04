/**
 * @file 工作流模板测试
 * @description 测试工作流模板的正确性
 * @module components/content-creator/workflows/poster/index.test
 */

import { describe, it, expect } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import {
  allWorkflowTemplates,
  workflowTemplateRegistry,
  getWorkflowTemplate,
  getWorkflowsByCategory,
  searchWorkflows,
  ecommercePromoWorkflow,
  brandImageWorkflow,
  socialMediaWorkflow,
} from "./index";
import type { WorkflowCategory } from "./types";

/**
 * WorkflowCategory 生成器
 */
const workflowCategoryArb = fc.constantFrom<WorkflowCategory>(
  "ecommerce",
  "branding",
  "social",
  "event",
  "education",
  "custom",
);

describe("工作流模板属性测试", () => {
  /**
   * Property: 所有工作流模板应该有有效的步骤列表
   */
  it("所有工作流模板应该至少有一个步骤", () => {
    allWorkflowTemplates.forEach((template) => {
      expect(template.steps.length).toBeGreaterThan(0);
    });
  });

  /**
   * Property: 所有步骤应该有有效的 agentId
   */
  it("所有步骤应该有有效的 agentId", () => {
    const validAgentIds = [
      "requirement",
      "style",
      "layout",
      "content",
      "refine",
      "export",
    ];

    allWorkflowTemplates.forEach((template) => {
      template.steps.forEach((step) => {
        expect(validAgentIds).toContain(step.agentId);
      });
    });
  });

  /**
   * Property: getWorkflowsByCategory 应该返回正确分类的工作流
   */
  test.prop([workflowCategoryArb])(
    "getWorkflowsByCategory 应该返回正确分类的工作流",
    (category) => {
      const workflows = getWorkflowsByCategory(category);
      workflows.forEach((workflow) => {
        expect(workflow.category).toBe(category);
      });
    },
  );
});

describe("工作流模板单元测试", () => {
  describe("allWorkflowTemplates", () => {
    it("应该包含 3 个工作流模板", () => {
      expect(allWorkflowTemplates).toHaveLength(3);
    });

    it("每个模板应该有唯一的 ID", () => {
      const ids = allWorkflowTemplates.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("ecommercePromoWorkflow", () => {
    it("应该有正确的 ID 和分类", () => {
      expect(ecommercePromoWorkflow.id).toBe("ecommerce-promo");
      expect(ecommercePromoWorkflow.category).toBe("ecommerce");
    });

    it("应该有 6 个步骤", () => {
      expect(ecommercePromoWorkflow.steps).toHaveLength(6);
    });

    it("步骤顺序应该正确", () => {
      const stepIds = ecommercePromoWorkflow.steps.map((s) => s.agentId);
      expect(stepIds).toEqual([
        "requirement",
        "style",
        "layout",
        "content",
        "refine",
        "export",
      ]);
    });

    it("refine 步骤应该是可选的", () => {
      const refineStep = ecommercePromoWorkflow.steps.find(
        (s) => s.agentId === "refine",
      );
      expect(refineStep?.optional).toBe(true);
    });

    it("应该有建议尺寸", () => {
      expect(ecommercePromoWorkflow.suggestedDimensions).toBeDefined();
      expect(
        ecommercePromoWorkflow.suggestedDimensions!.length,
      ).toBeGreaterThan(0);
    });
  });

  describe("brandImageWorkflow", () => {
    it("应该有正确的 ID 和分类", () => {
      expect(brandImageWorkflow.id).toBe("brand-image");
      expect(brandImageWorkflow.category).toBe("branding");
    });

    it("应该有 6 个步骤", () => {
      expect(brandImageWorkflow.steps).toHaveLength(6);
    });

    it("应该有品牌相关的输入字段", () => {
      const requirementStep = brandImageWorkflow.steps.find(
        (s) => s.agentId === "requirement",
      );
      const inputFields = requirementStep?.inputFields || [];
      const fieldKeys = inputFields.map((f) => f.key);

      expect(fieldKeys).toContain("brandName");
      expect(fieldKeys).toContain("brandTone");
    });
  });

  describe("socialMediaWorkflow", () => {
    it("应该有正确的 ID 和分类", () => {
      expect(socialMediaWorkflow.id).toBe("social-media");
      expect(socialMediaWorkflow.category).toBe("social");
    });

    it("应该有 6 个步骤", () => {
      expect(socialMediaWorkflow.steps).toHaveLength(6);
    });

    it("应该有平台选择字段", () => {
      const requirementStep = socialMediaWorkflow.steps.find(
        (s) => s.agentId === "requirement",
      );
      const platformField = requirementStep?.inputFields?.find(
        (f) => f.key === "platform",
      );

      expect(platformField).toBeDefined();
      expect(platformField?.type).toBe("select");
      expect(platformField?.options).toContain("小红书");
    });
  });

  describe("getWorkflowTemplate", () => {
    it("应该返回正确的工作流模板", () => {
      expect(getWorkflowTemplate("ecommerce-promo")).toBe(
        ecommercePromoWorkflow,
      );
      expect(getWorkflowTemplate("brand-image")).toBe(brandImageWorkflow);
      expect(getWorkflowTemplate("social-media")).toBe(socialMediaWorkflow);
    });

    it("应该对未知 ID 返回 undefined", () => {
      expect(getWorkflowTemplate("unknown")).toBeUndefined();
    });
  });

  describe("getWorkflowsByCategory", () => {
    it("应该返回电商分类的工作流", () => {
      const workflows = getWorkflowsByCategory("ecommerce");
      expect(workflows).toHaveLength(1);
      expect(workflows[0].id).toBe("ecommerce-promo");
    });

    it("应该返回品牌分类的工作流", () => {
      const workflows = getWorkflowsByCategory("branding");
      expect(workflows).toHaveLength(1);
      expect(workflows[0].id).toBe("brand-image");
    });

    it("应该返回社交分类的工作流", () => {
      const workflows = getWorkflowsByCategory("social");
      expect(workflows).toHaveLength(1);
      expect(workflows[0].id).toBe("social-media");
    });

    it("应该对没有工作流的分类返回空数组", () => {
      const workflows = getWorkflowsByCategory("event");
      expect(workflows).toHaveLength(0);
    });
  });

  describe("searchWorkflows", () => {
    it("应该通过名称搜索工作流", () => {
      const results = searchWorkflows("电商");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("ecommerce-promo");
    });

    it("应该通过描述搜索工作流", () => {
      const results = searchWorkflows("品牌");
      expect(results.length).toBeGreaterThan(0);
    });

    it("应该通过标签搜索工作流", () => {
      const results = searchWorkflows("小红书");
      expect(results.length).toBeGreaterThan(0);
    });

    it("应该对无匹配返回空数组", () => {
      const results = searchWorkflows("不存在的关键词xyz");
      expect(results).toHaveLength(0);
    });

    it("搜索应该不区分大小写", () => {
      const results1 = searchWorkflows("社交");
      const results2 = searchWorkflows("社交媒体");
      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
    });
  });

  describe("workflowTemplateRegistry", () => {
    it("应该包含所有工作流模板", () => {
      expect(Object.keys(workflowTemplateRegistry)).toHaveLength(3);
      expect(workflowTemplateRegistry["ecommerce-promo"]).toBeDefined();
      expect(workflowTemplateRegistry["brand-image"]).toBeDefined();
      expect(workflowTemplateRegistry["social-media"]).toBeDefined();
    });
  });
});
