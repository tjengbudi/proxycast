/**
 * @file ContentAgent.ts
 * @description 内容填充 Agent，基于布局和素材生成具体的设计元素
 * @module components/content-creator/agents/poster/ContentAgent
 */

import { BaseAgent } from "../base/BaseAgent";
import type {
  AgentInput,
  AgentOutput,
  LayoutScheme,
  StyleRecommendation,
  FabricObject,
} from "../base/types";
import type { Material } from "@/types/material";

/**
 * 内容填充 Agent
 *
 * 基于布局方案和素材库，生成具体的设计元素内容。
 */
export class ContentAgent extends BaseAgent {
  constructor() {
    super({
      id: "content-agent",
      name: "内容填充 Agent",
      description: "生成具体的设计元素内容",
      temperature: 0.7,
    });
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { layout } = input.context as {
      layout?: LayoutScheme;
    };
    const materials = input.materials || [];

    const prompt = this.buildPrompt(input);
    const response = await this.callLLM(prompt);

    const content = response.content as {
      text?: {
        title?: string;
        subtitle?: string;
        callToAction?: string;
      };
      images?: Array<{
        type: string;
        description: string;
        position: string;
      }>;
    };

    // 填充布局中的占位元素
    const filledLayout = layout
      ? this.fillLayoutContent(layout, content, materials)
      : null;

    return {
      suggestions: [
        {
          id: "filled-content",
          type: "element",
          title: "内容填充完成",
          description: "基于您的需求和素材生成了设计内容",
          content: filledLayout,
          reason: "基于您的需求和素材生成了设计内容",
          confidence: 0.85,
        },
      ],
      metadata: {
        textContent: content?.text,
        imageRecommendations: content?.images,
      },
    };
  }

  /**
   * 填充布局内容
   */
  private fillLayoutContent(
    layout: LayoutScheme,
    content: {
      text?: {
        title?: string;
        subtitle?: string;
        callToAction?: string;
      };
      images?: Array<{
        type: string;
        description: string;
        position: string;
      }>;
    },
    materials: Material[],
  ): LayoutScheme {
    const filledObjects = layout.fabricJson.objects.map((obj) => {
      // 填充文字内容
      if (obj.type === "textbox") {
        if (
          obj.name === "title" ||
          obj.text === "主标题文字" ||
          obj.text === "大标题"
        ) {
          return { ...obj, text: content?.text?.title || obj.text };
        }
        if (
          obj.name === "subtitle" ||
          obj.text === "副标题文字" ||
          obj.text === "副标题描述文字"
        ) {
          return { ...obj, text: content?.text?.subtitle || obj.text };
        }
        if (
          obj.name === "cta-text" ||
          obj.text === "立即查看" ||
          obj.text === "立即购买"
        ) {
          return { ...obj, text: content?.text?.callToAction || obj.text };
        }
      }

      // 标记图片占位区域
      if (
        obj.type === "rect" &&
        obj.fill === "#E0E0E0" &&
        obj.name?.includes("image")
      ) {
        // 如果有匹配的素材，添加图片 URL
        const matchedMaterial = materials.find((m) => m.type === "image");
        if (matchedMaterial?.content) {
          return {
            type: "image",
            left: obj.left,
            top: obj.top,
            width: obj.width,
            height: obj.height,
            src: matchedMaterial.content,
            name: obj.name,
          };
        }
      }

      return obj;
    });

    return {
      ...layout,
      fabricJson: {
        ...layout.fabricJson,
        objects: filledObjects as FabricObject[],
      },
    };
  }

  protected buildPrompt(input: AgentInput): string {
    const { layout, requirement, style } = input.context as {
      layout?: LayoutScheme;
      requirement?: Record<string, unknown>;
      style?: StyleRecommendation;
    };

    return `你是一个海报文案专家。请基于以下需求生成海报文案：

设计需求:
${JSON.stringify(requirement, null, 2)}

布局类型: ${layout?.name || "未指定"}
设计风格: ${style?.name || "未指定"}

请生成以下内容：
1. 主标题（简洁有力，8-15 字）
2. 副标题（补充说明，15-30 字）
3. 行动号召（引导用户，2-6 字）
4. 图片建议（需要什么类型的图片）

输出 JSON 格式:
\`\`\`json
{
  "content": {
    "text": {
      "title": "主标题内容",
      "subtitle": "副标题内容",
      "callToAction": "立即抢购"
    },
    "images": [
      {
        "type": "product",
        "description": "产品主图，白底高清",
        "position": "center"
      }
    ]
  }
}
\`\`\``;
  }
}

export default ContentAgent;
