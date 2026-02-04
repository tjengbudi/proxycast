/**
 * @file RequirementAgent.ts
 * @description 需求分析 Agent，分析用户设计需求，生成结构化需求报告
 * @module components/content-creator/agents/poster/RequirementAgent
 */

import { BaseAgent } from "../base/BaseAgent";
import type {
  AgentInput,
  AgentOutput,
  RequirementAnalysis,
} from "../base/types";

/**
 * 需求分析 Agent
 *
 * 分析用户的设计需求，提取关键信息，生成结构化的需求报告。
 */
export class RequirementAgent extends BaseAgent {
  constructor() {
    super({
      id: "requirement-agent",
      name: "需求分析 Agent",
      description: "分析用户设计需求，生成结构化需求报告",
      temperature: 0.3,
    });
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const prompt = this.buildPrompt(input);
    const response = await this.callLLM(prompt);

    const analysis = response.analysis as RequirementAnalysis;

    return {
      suggestions: [
        {
          id: "requirement-analysis",
          type: "choice",
          title: "需求分析结果",
          description: "基于您的输入，我分析了设计需求",
          content: analysis,
          reason: "基于您的输入，我分析了设计需求",
          confidence: 0.9,
        },
      ],
      metadata: {
        inputSummary: `${input.context.purpose} - ${input.context.platform}`,
      },
    };
  }

  protected buildPrompt(input: AgentInput): string {
    const { purpose, platform, content, style } = input.context as {
      purpose?: string;
      platform?: string;
      content?: string;
      style?: string;
    };

    return `你是一个资深的海报设计师。请分析以下设计需求：

使用场景: ${purpose || "未指定"}
目标平台: ${platform || "未指定"}
核心信息: ${content || "未指定"}
风格偏好: ${style || "未指定"}

请输出结构化的需求分析报告，包含：
1. 设计目的（吸引点击/传达信息/品牌展示等）
2. 目标受众分析（人群特征、年龄、兴趣）
3. 关键元素提取（主文案、副文案、行动号召）
4. 视觉要求（推荐尺寸、色彩氛围、风格）
5. 约束条件（平台规范、品牌要求等）

输出 JSON 格式:
\`\`\`json
{
  "analysis": {
    "purpose": "设计目的",
    "audience": {
      "demographic": "目标人群描述",
      "ageRange": "18-35岁",
      "interests": ["兴趣1", "兴趣2"]
    },
    "keyElements": {
      "primaryText": "主要文案",
      "secondaryText": "次要文案",
      "callToAction": "立即抢购"
    },
    "visualRequirements": {
      "recommendedSize": { "width": 1080, "height": 1440 },
      "colorMood": "春季清新、粉色系",
      "style": "简约现代"
    },
    "constraints": ["小红书竖版规范", "需要留出安全区域"]
  }
}
\`\`\``;
  }
}

export default RequirementAgent;
