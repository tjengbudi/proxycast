/**
 * @file StyleAgent.ts
 * @description 风格推荐 Agent，基于需求推荐设计风格和配色方案
 * @module components/content-creator/agents/poster/StyleAgent
 */

import { BaseAgent } from "../base/BaseAgent";
import type {
  AgentInput,
  AgentOutput,
  StyleRecommendation,
} from "../base/types";
import type { BrandPersona } from "@/types/brand-persona";

/**
 * 预设风格库
 */
const PRESET_STYLES: StyleRecommendation[] = [
  {
    id: "minimal-modern",
    name: "简约现代",
    description: "干净利落的现代设计风格",
    colorPalette: {
      primary: "#FF6B9D",
      secondary: "#FFC0D0",
      accent: "#FF4081",
      background: "#FFFFFF",
      text: "#333333",
    },
    typography: {
      titleFont: "思源黑体",
      bodyFont: "苹方",
      titleSize: 72,
      bodySize: 24,
    },
    mood: "时尚、清新",
    suitableFor: ["时尚品牌", "美妆", "生活方式"],
  },
  {
    id: "vibrant-youth",
    name: "活力青春",
    description: "充满活力的年轻化设计",
    colorPalette: {
      primary: "#FF9500",
      secondary: "#FFD166",
      accent: "#EF476F",
      background: "#FFFFFF",
      text: "#2D3436",
    },
    typography: {
      titleFont: "站酷快乐体",
      bodyFont: "思源黑体",
      titleSize: 80,
      bodySize: 22,
    },
    mood: "活力、热情",
    suitableFor: ["运动品牌", "年轻消费品", "娱乐"],
  },
  {
    id: "luxury-elegant",
    name: "高端奢华",
    description: "精致优雅的高端设计",
    colorPalette: {
      primary: "#D4AF37",
      secondary: "#1C1C1C",
      accent: "#C9A86C",
      background: "#0A0A0A",
      text: "#FFFFFF",
    },
    typography: {
      titleFont: "方正宋刻本秀楷",
      bodyFont: "思源宋体",
      titleSize: 64,
      bodySize: 20,
    },
    mood: "奢华、精致",
    suitableFor: ["奢侈品", "高端服务", "金融"],
  },
  {
    id: "fresh-natural",
    name: "清新自然",
    description: "自然清新的绿色系设计",
    colorPalette: {
      primary: "#4CAF50",
      secondary: "#81C784",
      accent: "#2E7D32",
      background: "#F1F8E9",
      text: "#33691E",
    },
    typography: {
      titleFont: "思源黑体",
      bodyFont: "苹方",
      titleSize: 68,
      bodySize: 22,
    },
    mood: "自然、健康",
    suitableFor: ["健康食品", "环保产品", "户外运动"],
  },
  {
    id: "tech-future",
    name: "科技未来",
    description: "科技感十足的未来风格",
    colorPalette: {
      primary: "#00BCD4",
      secondary: "#0097A7",
      accent: "#00E5FF",
      background: "#0D1B2A",
      text: "#E0E0E0",
    },
    typography: {
      titleFont: "思源黑体",
      bodyFont: "苹方",
      titleSize: 70,
      bodySize: 20,
    },
    mood: "科技、未来",
    suitableFor: ["科技产品", "数码设备", "互联网服务"],
  },
];

/**
 * 风格推荐 Agent
 *
 * 基于需求分析结果推荐合适的设计风格和配色方案。
 */
export class StyleAgent extends BaseAgent {
  constructor() {
    super({
      id: "style-agent",
      name: "风格推荐 Agent",
      description: "推荐设计风格和配色方案",
      temperature: 0.6,
    });
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const persona = input.persona;

    // 如果有品牌人设，优先使用品牌风格
    if (persona) {
      return {
        suggestions: [
          {
            id: "brand-style",
            type: "style",
            title: `品牌风格: ${persona.name}`,
            description: `使用品牌人设「${persona.name}」的设计规范`,
            content: this.buildStyleFromPersona(persona),
            reason: `使用品牌人设「${persona.name}」的设计规范`,
            confidence: 1.0,
          },
        ],
      };
    }

    // 否则基于需求推荐风格
    const prompt = this.buildPrompt(input);
    const response = await this.callLLM(prompt);

    // 匹配最合适的预设风格
    const keywords = (response.keywords as string[]) || [];
    const matchedStyles = this.matchStyles(keywords);

    return {
      suggestions: matchedStyles.map((style, index) => ({
        id: style.id,
        type: "style" as const,
        title: style.name,
        description: style.description,
        content: style,
        reason: `${style.description}，适合${style.suitableFor.join("、")}`,
        confidence: 1 - index * 0.15,
        preview: style.preview,
      })),
    };
  }

  /**
   * 从品牌人设构建风格
   */
  private buildStyleFromPersona(persona: BrandPersona): StyleRecommendation {
    const design = persona.design;
    const brandTone = persona.brandTone;

    return {
      id: `brand-${persona.id}`,
      name: persona.name,
      description: `${persona.name} 品牌风格`,
      colorPalette: design?.colorScheme || {
        primary: "#2196F3",
        secondary: "#90CAF9",
        accent: "#1976D2",
        background: "#FFFFFF",
        text: "#212121",
      },
      typography: design?.typography || {
        titleFont: "思源黑体",
        bodyFont: "苹方",
        titleSize: 72,
        bodySize: 24,
      },
      mood: brandTone?.keywords?.join("、") || "专业",
      suitableFor: [brandTone?.targetAudience || "通用"],
    };
  }

  /**
   * 匹配风格
   */
  private matchStyles(keywords: string[]): StyleRecommendation[] {
    return PRESET_STYLES.map((style) => ({
      style,
      score: this.calculateMatchScore(style, keywords),
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.style);
  }

  /**
   * 计算匹配分数
   */
  private calculateMatchScore(
    style: StyleRecommendation,
    keywords: string[],
  ): number {
    let score = 0;
    keywords.forEach((keyword) => {
      if (style.mood.includes(keyword)) score += 2;
      if (style.suitableFor.some((s) => s.includes(keyword))) score += 1;
      if (style.name.includes(keyword)) score += 1;
    });
    return score;
  }

  protected buildPrompt(input: AgentInput): string {
    const { requirement, stylePreference } = input.context as {
      requirement?: Record<string, unknown>;
      stylePreference?: string;
    };

    return `你是一个设计风格专家。请基于以下需求分析，提取关键词用于风格匹配：

需求分析:
${JSON.stringify(requirement, null, 2)}

用户偏好: ${stylePreference || "未指定"}

请提取 3-5 个关键词，用于匹配设计风格。关键词应该描述：
- 目标受众特征（如：年轻、高端、专业）
- 情感氛围（如：活力、温馨、科技）
- 行业特征（如：时尚、健康、金融）

输出 JSON 格式:
\`\`\`json
{
  "keywords": ["关键词1", "关键词2", "关键词3"]
}
\`\`\``;
  }
}

export default StyleAgent;
