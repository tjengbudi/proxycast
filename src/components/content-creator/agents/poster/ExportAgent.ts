/**
 * @file ExportAgent.ts
 * @description 导出处理 Agent，优化导出设置，适配不同平台
 * @module components/content-creator/agents/poster/ExportAgent
 */

import { BaseAgent } from "../base/BaseAgent";
import type {
  AgentInput,
  AgentOutput,
  ExportOptimization,
} from "../base/types";

/**
 * 平台规范
 */
const PLATFORM_SPECS: Record<
  string,
  Record<string, { width: number; height: number; ratio: string }>
> = {
  xiaohongshu: {
    cover: { width: 1080, height: 1440, ratio: "3:4" },
    square: { width: 1080, height: 1080, ratio: "1:1" },
  },
  wechat: {
    moment: { width: 1080, height: 1080, ratio: "1:1" },
    article: { width: 900, height: 383, ratio: "2.35:1" },
  },
  taobao: {
    main: { width: 800, height: 800, ratio: "1:1" },
    detail: { width: 750, height: 1000, ratio: "3:4" },
  },
  douyin: {
    cover: { width: 1080, height: 1920, ratio: "9:16" },
    square: { width: 1080, height: 1080, ratio: "1:1" },
  },
  weibo: {
    single: { width: 1080, height: 1080, ratio: "1:1" },
    long: { width: 1080, height: 1920, ratio: "9:16" },
  },
};

/**
 * 导出处理 Agent
 *
 * 优化导出设置，适配不同平台的规范要求。
 */
export class ExportAgent extends BaseAgent {
  constructor() {
    super({
      id: "export-agent",
      name: "导出处理 Agent",
      description: "优化导出设置，适配不同平台",
      temperature: 0.2,
    });
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { currentDesign, targetPlatforms } = input.context as {
      currentDesign?: {
        width?: number;
        height?: number;
      };
      targetPlatforms?: string[];
    };

    const platforms = targetPlatforms || ["xiaohongshu"];

    const optimizations = platforms.map((platform) =>
      this.optimizeForPlatform(currentDesign, platform),
    );

    return {
      suggestions: optimizations.map((opt) => ({
        id: `export-${opt.platform}`,
        type: "choice" as const,
        title: `${this.getPlatformDisplayName(opt.platform)} 导出`,
        description: `针对 ${this.getPlatformDisplayName(opt.platform)} 平台优化`,
        content: opt,
        reason: `针对 ${this.getPlatformDisplayName(opt.platform)} 平台优化`,
        confidence: 0.95,
      })),
    };
  }

  /**
   * 针对平台优化
   */
  private optimizeForPlatform(
    design: { width?: number; height?: number } | undefined,
    platform: string,
  ): ExportOptimization {
    const spec = PLATFORM_SPECS[platform];
    const targetSize = spec?.cover ||
      spec?.main || { width: 1080, height: 1080 };

    const adjustments: ExportOptimization["adjustments"] = [];

    // 检查尺寸是否匹配
    if (
      design?.width !== targetSize.width ||
      design?.height !== targetSize.height
    ) {
      adjustments.push({
        type: "resize",
        description: `调整尺寸为 ${targetSize.width}×${targetSize.height}`,
        applied: true,
      });
    }

    // 检查安全区域
    adjustments.push({
      type: "safe-zone",
      description: "确保重要内容在安全区域内",
      applied: true,
    });

    // 平台特定优化
    if (platform === "xiaohongshu") {
      adjustments.push({
        type: "watermark-space",
        description: "底部预留水印空间",
        applied: true,
      });
    }

    if (platform === "wechat") {
      adjustments.push({
        type: "compression",
        description: "优化文件大小以适应微信压缩",
        applied: true,
      });
    }

    // 格式建议
    const format = platform === "wechat" ? "jpg" : "png";
    const quality = format === "jpg" ? 85 : 100;

    return {
      platform,
      size: targetSize,
      format,
      quality,
      adjustments,
    };
  }

  /**
   * 获取平台显示名称
   */
  private getPlatformDisplayName(platform: string): string {
    const names: Record<string, string> = {
      xiaohongshu: "小红书",
      wechat: "微信",
      taobao: "淘宝",
      douyin: "抖音",
      weibo: "微博",
    };
    return names[platform] || platform;
  }

  protected buildPrompt(_input: AgentInput): string {
    // ExportAgent 主要基于规则，不需要 LLM
    return "";
  }
}

export default ExportAgent;
