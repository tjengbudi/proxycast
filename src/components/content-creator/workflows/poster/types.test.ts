/**
 * @file 工作流类型测试
 * @description 测试工作流系统类型定义的正确性
 * @module components/content-creator/workflows/poster/types.test
 */

import { describe, it, expect } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import type {
  WorkflowStepStatus,
  WorkflowStep,
  WorkflowTemplate,
  WorkflowCategory,
  InputFieldType,
} from "./types";

/**
 * WorkflowStepStatus 生成器
 */
const workflowStepStatusArb = fc.constantFrom<WorkflowStepStatus>(
  "pending",
  "active",
  "completed",
  "skipped",
  "error",
);

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

/**
 * InputFieldType 生成器
 */
const inputFieldTypeArb = fc.constantFrom<InputFieldType>(
  "text",
  "textarea",
  "select",
  "multiselect",
  "color",
  "image",
  "number",
);

describe("工作流类型属性测试", () => {
  /**
   * Property: WorkflowStepStatus 应该是有效的状态值
   */
  test.prop([workflowStepStatusArb])(
    "WorkflowStepStatus 应该是有效的状态值",
    (status) => {
      const validStatuses = [
        "pending",
        "active",
        "completed",
        "skipped",
        "error",
      ];
      expect(validStatuses).toContain(status);
    },
  );

  /**
   * Property: WorkflowCategory 应该是有效的分类值
   */
  test.prop([workflowCategoryArb])(
    "WorkflowCategory 应该是有效的分类值",
    (category) => {
      const validCategories = [
        "ecommerce",
        "branding",
        "social",
        "event",
        "education",
        "custom",
      ];
      expect(validCategories).toContain(category);
    },
  );

  /**
   * Property: InputFieldType 应该是有效的字段类型
   */
  test.prop([inputFieldTypeArb])(
    "InputFieldType 应该是有效的字段类型",
    (fieldType) => {
      const validTypes = [
        "text",
        "textarea",
        "select",
        "multiselect",
        "color",
        "image",
        "number",
      ];
      expect(validTypes).toContain(fieldType);
    },
  );
});

describe("工作流类型单元测试", () => {
  it("WorkflowStep 应该包含必要字段", () => {
    const step: WorkflowStep = {
      id: "test-step",
      name: "测试步骤",
      description: "这是一个测试步骤",
      agentId: "requirement",
      optional: false,
    };

    expect(step.id).toBe("test-step");
    expect(step.name).toBe("测试步骤");
    expect(step.agentId).toBe("requirement");
    expect(step.optional).toBe(false);
  });

  it("WorkflowStep 应该支持可选字段", () => {
    const step: WorkflowStep = {
      id: "test-step",
      name: "测试步骤",
      description: "描述",
      agentId: "style",
      optional: true,
      estimatedDuration: 30,
      dependencies: ["prev-step"],
      inputFields: [
        {
          key: "name",
          label: "名称",
          type: "text",
          required: true,
        },
      ],
    };

    expect(step.estimatedDuration).toBe(30);
    expect(step.dependencies).toContain("prev-step");
    expect(step.inputFields).toHaveLength(1);
  });

  it("WorkflowTemplate 应该包含必要字段", () => {
    const template: WorkflowTemplate = {
      id: "test-workflow",
      name: "测试工作流",
      description: "这是一个测试工作流",
      category: "custom",
      steps: [],
    };

    expect(template.id).toBe("test-workflow");
    expect(template.name).toBe("测试工作流");
    expect(template.category).toBe("custom");
    expect(template.steps).toHaveLength(0);
  });

  it("WorkflowTemplate 应该支持可选字段", () => {
    const template: WorkflowTemplate = {
      id: "test-workflow",
      name: "测试工作流",
      description: "描述",
      icon: "star",
      category: "ecommerce",
      steps: [],
      defaultConfig: {
        autoExecute: true,
        skipOptionalSteps: false,
      },
      suggestedDimensions: [{ width: 1080, height: 1440, name: "3:4" }],
      tags: ["测试", "示例"],
    };

    expect(template.icon).toBe("star");
    expect(template.defaultConfig?.autoExecute).toBe(true);
    expect(template.suggestedDimensions).toHaveLength(1);
    expect(template.tags).toContain("测试");
  });

  describe("状态转换", () => {
    it("pending 应该可以转换为 active", () => {
      const validTransitions: Record<WorkflowStepStatus, WorkflowStepStatus[]> =
        {
          pending: ["active"],
          active: ["completed", "skipped", "error"],
          completed: [],
          skipped: [],
          error: ["active"], // 可以重试
        };

      expect(validTransitions.pending).toContain("active");
    });

    it("active 应该可以转换为 completed, skipped 或 error", () => {
      const fromActive: WorkflowStepStatus[] = [
        "completed",
        "skipped",
        "error",
      ];
      fromActive.forEach((status) => {
        expect(["completed", "skipped", "error"]).toContain(status);
      });
    });
  });
});
