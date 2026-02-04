/**
 * @file RefineAgent.ts
 * @description 优化建议 Agent，分析设计稿，提供优化建议
 * @module components/content-creator/agents/poster/RefineAgent
 */

import { BaseAgent } from "../base/BaseAgent";
import type {
  AgentInput,
  AgentOutput,
  RefineSuggestion,
  FabricObject,
  StyleRecommendation,
} from "../base/types";

/**
 * 优化建议 Agent
 *
 * 分析当前设计稿，基于设计规则和 AI 分析提供优化建议。
 */
export class RefineAgent extends BaseAgent {
  constructor() {
    super({
      id: "refine-agent",
      name: "优化建议 Agent",
      description: "分析设计稿，提供优化建议",
      temperature: 0.3,
    });
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { currentDesign } = input.context as {
      currentDesign?: {
        fabricJson?: {
          objects?: FabricObject[];
        };
      };
    };

    // 1. 运行规则检查
    const ruleResults = currentDesign?.fabricJson?.objects
      ? this.runDesignRules(currentDesign.fabricJson.objects)
      : [];

    // 2. 调用 AI 进行高级分析
    const prompt = this.buildPrompt(input);
    const response = await this.callLLM(prompt);

    const aiSuggestions = (response.suggestions as RefineSuggestion[]) || [];

    // 3. 合并建议
    const allSuggestions = [...ruleResults, ...aiSuggestions];

    return {
      suggestions: allSuggestions.map((suggestion, index) => ({
        id: `refine-${index}`,
        type: "choice" as const,
        title: suggestion.description,
        description: suggestion.reason,
        content: suggestion,
        reason: suggestion.reason,
        confidence: suggestion.severity === "warning" ? 0.9 : 0.7,
      })),
    };
  }

  /**
   * 运行设计规则检查
   */
  private runDesignRules(objects: FabricObject[]): RefineSuggestion[] {
    const suggestions: RefineSuggestion[] = [];

    // 检查对齐
    const textObjects = objects.filter((o) => o.type === "textbox");
    if (textObjects.length > 1) {
      const lefts = textObjects.map((o) => o.left);
      const uniqueLefts = new Set(lefts);
      if (uniqueLefts.size > 2) {
        suggestions.push({
          category: "alignment",
          severity: "suggestion",
          description: "文字元素左对齐不一致",
          reason: "统一的对齐方式可以提升视觉整洁度",
          action: {
            type: "adjust",
            target: "text-elements",
            property: "left",
            value: Math.min(...lefts),
          },
        });
      }
    }

    // 检查间距一致性
    if (textObjects.length > 2) {
      const tops = textObjects.map((o) => o.top).sort((a, b) => a - b);
      const gaps: number[] = [];
      for (let i = 1; i < tops.length; i++) {
        gaps.push(tops[i] - tops[i - 1]);
      }
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const hasInconsistentGaps = gaps.some(
        (gap) => Math.abs(gap - avgGap) > avgGap * 0.3,
      );
      if (hasInconsistentGaps) {
        suggestions.push({
          category: "layout",
          severity: "suggestion",
          description: "文字元素间距不一致",
          reason: "统一的间距可以提升视觉节奏感",
          action: {
            type: "adjust",
            target: "text-elements",
            property: "spacing",
            value: avgGap,
          },
        });
      }
    }

    // 检查字号层次
    const fontSizes = textObjects
      .map((o) => o.fontSize)
      .filter((s): s is number => s !== undefined);
    if (fontSizes.length > 1) {
      const uniqueSizes = new Set(fontSizes);
      if (uniqueSizes.size === 1) {
        suggestions.push({
          category: "typography",
          severity: "info",
          description: "所有文字字号相同",
          reason: "不同层级的文字应该有明显的字号差异，以建立视觉层次",
          action: {
            type: "adjust",
            target: "title",
            property: "fontSize",
            value: Math.max(...fontSizes) * 1.5,
          },
        });
      }
    }

    return suggestions;
  }

  protected buildPrompt(input: AgentInput): string {
    const { currentDesign, style } = input.context as {
      currentDesign?: Record<string, unknown>;
      style?: StyleRecommendation;
    };

    return `你是一个设计审核专家。请分析以下海报设计，提出优化建议：

设计数据:
${JSON.stringify(currentDesign, null, 2)}

目标风格: ${style?.name || "未指定"}

请从以下维度分析：
1. 布局结构：空间分配是否合理
2. 视觉层次：主次关系是否清晰
3. 色彩搭配：是否协调统一
4. 文字排版：字号、间距是否合适
5. 对齐方式：元素是否整齐

输出 JSON 格式:
\`\`\`json
{
  "suggestions": [
    {
      "category": "typography",
      "severity": "suggestion",
      "description": "标题与副标题间距建议增加",
      "reason": "当前间距偏小，影响阅读节奏",
      "action": {
        "type": "adjust",
        "target": "subtitle",
        "property": "top",
        "value": "+20"
      }
    }
  ]
}
\`\`\``;
  }
}

export default RefineAgent;
