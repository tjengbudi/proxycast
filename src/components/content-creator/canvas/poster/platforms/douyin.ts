/**
 * @file douyin.ts
 * @description 抖音平台规范
 * @module components/content-creator/canvas/poster/platforms/douyin
 */

import type { PlatformSpec } from "./types";

/**
 * 抖音平台规范
 */
export const douyinSpec: PlatformSpec = {
  id: "douyin",
  name: "抖音",
  icon: "douyin",
  description: "抖音视频封面、图文、直播规范",
  sizes: [
    {
      name: "竖版视频封面 9:16",
      width: 1080,
      height: 1920,
      aspectRatio: "9:16",
      usage: "竖版视频封面，最常用格式",
      recommended: true,
    },
    {
      name: "横版视频封面 16:9",
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      usage: "横版视频封面",
    },
    {
      name: "方形视频封面 1:1",
      width: 1080,
      height: 1080,
      aspectRatio: "1:1",
      usage: "方形视频封面",
    },
    {
      name: "图文笔记 3:4",
      width: 1080,
      height: 1440,
      aspectRatio: "3:4",
      usage: "抖音图文笔记",
    },
    {
      name: "直播封面",
      width: 1080,
      height: 1920,
      aspectRatio: "9:16",
      usage: "直播间封面图",
    },
    {
      name: "商品橱窗图",
      width: 800,
      height: 800,
      aspectRatio: "1:1",
      usage: "抖音小店商品图",
    },
  ],
  safeZone: {
    top: 150,
    bottom: 300,
    left: 40,
    right: 40,
    description: "顶部有状态栏，底部有互动按钮和文字区域",
  },
  fileSpec: {
    formats: ["jpg", "png", "webp"],
    maxSizeKB: 15360, // 15MB
    recommendedDPI: 72,
    colorMode: "RGB",
  },
  textSpec: {
    minFontSize: 28,
    recommendedTitleSize: 56,
    recommendedBodySize: 36,
    lineHeightRatio: 1.4,
  },
  notes: [
    "封面是吸引点击的关键，建议使用高对比度",
    "底部1/4区域会被文字和按钮遮挡",
    "顶部有状态栏，避免放置重要信息",
    "建议使用大字体，确保在信息流中清晰",
    "封面人物建议看向镜头或画面中心",
    "避免使用过于复杂的背景",
  ],
  guideUrl: "https://creator.douyin.com",
};

export default douyinSpec;
