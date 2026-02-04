/**
 * @file xiaohongshu.ts
 * @description 小红书平台规范
 * @module components/content-creator/canvas/poster/platforms/xiaohongshu
 */

import type { PlatformSpec } from "./types";

/**
 * 小红书平台规范
 */
export const xiaohongshuSpec: PlatformSpec = {
  id: "xiaohongshu",
  name: "小红书",
  icon: "xiaohongshu",
  description: "小红书图文笔记和视频封面规范",
  sizes: [
    {
      name: "竖版笔记 3:4",
      width: 1080,
      height: 1440,
      aspectRatio: "3:4",
      usage: "最常用的笔记封面尺寸，适合大多数内容",
      recommended: true,
    },
    {
      name: "方形笔记 1:1",
      width: 1080,
      height: 1080,
      aspectRatio: "1:1",
      usage: "方形图片，适合产品展示和对比图",
    },
    {
      name: "横版笔记 4:3",
      width: 1440,
      height: 1080,
      aspectRatio: "4:3",
      usage: "横版图片，适合风景和场景展示",
    },
    {
      name: "全屏竖版 9:16",
      width: 1080,
      height: 1920,
      aspectRatio: "9:16",
      usage: "全屏竖版，适合视频封面和沉浸式内容",
    },
    {
      name: "长图笔记 2:3",
      width: 1080,
      height: 1620,
      aspectRatio: "2:3",
      usage: "长图格式，适合信息量较大的内容",
    },
  ],
  safeZone: {
    top: 120,
    bottom: 180,
    left: 40,
    right: 40,
    description: "顶部预留标题区域，底部预留互动按钮区域",
  },
  fileSpec: {
    formats: ["jpg", "png", "webp"],
    maxSizeKB: 20480, // 20MB
    recommendedDPI: 72,
    colorMode: "RGB",
  },
  textSpec: {
    minFontSize: 24,
    recommendedTitleSize: 48,
    recommendedBodySize: 32,
    lineHeightRatio: 1.5,
  },
  notes: [
    "首图决定点击率，建议使用高质量图片",
    "标题文字不要太小，确保在信息流中清晰可见",
    "避免在底部放置重要信息，会被互动按钮遮挡",
    "建议使用明亮、高饱和度的配色",
    "多图笔记建议保持风格统一",
  ],
  guideUrl: "https://creator.xiaohongshu.com",
};

export default xiaohongshuSpec;
