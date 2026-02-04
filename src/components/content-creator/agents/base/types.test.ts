/**
 * @file Agent 类型测试
 * @description 测试 Agent 系统类型定义的正确性
 * @module components/content-creator/agents/base/types.test
 */

import { describe, it, expect } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import type {
  AgentConfig,
  AgentInput,
  AgentSuggestion,
  AgentSuggestionType,
  PosterAgentId,
} from "./types";

/**
 * AgentSuggestion 生成器
 */
const agentSuggestionArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  type: fc.constantFrom<AgentSuggestionType>(
    "layout",
    "element",
    "style",
    "text",
    "choice",
  ),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 })),
  content: fc.anything(),
  reason: fc.string({ minLength: 1, maxLength: 500 }),
  confidence: fc.double({ min: 0, max: 1, noNaN: true }),
  preview: fc.option(fc.string()),
});

/**
 * AgentOutput 生成器
 */
const agentOutputArb = fc.record({
  summary: fc.option(fc.string({ maxLength: 500 })),
  suggestions: fc.array(agentSuggestionArb, { minLength: 0, maxLength: 10 }),
  metadata: fc.option(fc.dictionary(fc.string(), fc.anything())),
});

/**
 * PosterAgentId 生成器
 */
const posterAgentIdArb = fc.constantFrom<PosterAgentId>(
  "requirement",
  "style",
  "layout",
  "content",
  "refine",
  "export",
);

describe("Agent 类型属性测试", () => {
  /**
   * Property: AgentSuggestion 的 confidence 应该在 [0, 1] 范围内
   */
  test.prop([agentSuggestionArb])(
    "AgentSuggestion confidence 应该在 [0, 1] 范围内",
    (suggestion) => {
      expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
      expect(suggestion.confidence).toBeLessThanOrEqual(1);
    },
  );

  /**
   * Property: AgentSuggestion 必须有非空的 id 和 title
   */
  test.prop([agentSuggestionArb])(
    "AgentSuggestion 必须有非空的 id 和 title",
    (suggestion) => {
      expect(suggestion.id.length).toBeGreaterThan(0);
      expect(suggestion.title.length).toBeGreaterThan(0);
    },
  );

  /**
   * Property: AgentOutput 的 suggestions 数组应该是有效的
   */
  test.prop([agentOutputArb])(
    "AgentOutput suggestions 应该是有效数组",
    (output) => {
      expect(Array.isArray(output.suggestions)).toBe(true);
      output.suggestions.forEach((suggestion) => {
        expect(suggestion.id).toBeDefined();
        expect(suggestion.type).toBeDefined();
        expect(suggestion.title).toBeDefined();
      });
    },
  );

  /**
   * Property: PosterAgentId 应该是有效的 Agent ID
   */
  test.prop([posterAgentIdArb])(
    "PosterAgentId 应该是有效的 Agent ID",
    (agentId) => {
      const validIds = [
        "requirement",
        "style",
        "layout",
        "content",
        "refine",
        "export",
      ];
      expect(validIds).toContain(agentId);
    },
  );
});

describe("Agent 类型单元测试", () => {
  it("AgentConfig 应该包含必要字段", () => {
    const config: AgentConfig = {
      id: "test-agent",
      name: "测试 Agent",
      description: "用于测试的 Agent",
      model: "gpt-4",
      temperature: 0.7,
    };

    expect(config.id).toBe("test-agent");
    expect(config.name).toBe("测试 Agent");
    expect(config.description).toBeDefined();
  });

  it("AgentInput 应该支持可选字段", () => {
    const minimalInput: AgentInput = {
      context: {},
    };

    expect(minimalInput.context).toBeDefined();
    expect(minimalInput.userInput).toBeUndefined();
    expect(minimalInput.persona).toBeUndefined();
    expect(minimalInput.materials).toBeUndefined();
  });

  it("AgentSuggestionType 应该包含所有有效类型", () => {
    const validTypes: AgentSuggestionType[] = [
      "layout",
      "element",
      "style",
      "text",
      "choice",
    ];

    validTypes.forEach((type) => {
      const suggestion: AgentSuggestion = {
        id: "test",
        type,
        title: "测试建议",
        content: {},
        reason: "测试原因",
        confidence: 0.8,
      };
      expect(suggestion.type).toBe(type);
    });
  });

  it("所有 PosterAgentId 应该是有效的", () => {
    const allAgentIds: PosterAgentId[] = [
      "requirement",
      "style",
      "layout",
      "content",
      "refine",
      "export",
    ];

    expect(allAgentIds).toHaveLength(6);
    allAgentIds.forEach((id) => {
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });
});
