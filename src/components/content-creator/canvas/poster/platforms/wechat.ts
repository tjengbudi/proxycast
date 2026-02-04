/**
 * @file wechat.ts
 * @description 微信平台规范
 * @module components/content-creator/canvas/poster/platforms/wechat
 */

import type { PlatformSpec } from "./types";

/**
 * 微信平台规范
 */
export const wechatSpec: PlatformSpec = {
  id: "wechat",
  name: "微信",
  icon: "wechat",
  description: "微信公众号、朋友圈、视频号规范",
  sizes: [
    {
      name: "公众号封面 2.35:1",
      width: 900,
      height: 383,
      aspectRatio: "2.35:1",
      usage: "公众号文章封面图，在订阅号消息列表显示",
      recommended: true,
    },
    {
      name: "公众号次图 1:1",
      width: 200,
      height: 200,
      aspectRatio: "1:1",
      usage: "公众号文章次条封面",
    },
    {
      name: "公众号正文图",
      width: 1080,
      height: 1080,
      aspectRatio: "1:1",
      usage: "公众号文章内配图，方形最佳",
    },
    {
      name: "朋友圈图片",
      width: 1080,
      height: 1080,
      aspectRatio: "1:1",
      usage: "朋友圈分享图片，方形显示最完整",
    },
    {
      name: "视频号封面 16:9",
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      usage: "视频号横版视频封面",
    },
    {
      name: "视频号封面 9:16",
      width: 1080,
      height: 1920,
      aspectRatio: "9:16",
      usage: "视频号竖版视频封面",
    },
    {
      name: "小程序分享图",
      width: 520,
      height: 416,
      aspectRatio: "5:4",
      usage: "小程序分享卡片图片",
    },
  ],
  safeZone: {
    top: 0,
    bottom: 0,
    left: 20,
    right: 20,
    description: "公众号封面两侧可能被裁切，重要内容居中",
  },
  fileSpec: {
    formats: ["jpg", "png", "gif"],
    maxSizeKB: 10240, // 10MB
    recommendedDPI: 72,
    colorMode: "RGB",
  },
  textSpec: {
    minFontSize: 14,
    recommendedTitleSize: 36,
    recommendedBodySize: 24,
    lineHeightRatio: 1.6,
  },
  notes: [
    "公众号封面图会被裁切，重要信息放中间",
    "朋友圈图片建议不超过9张",
    "GIF 图片大小限制较严格",
    "视频号封面建议使用高清图片",
    "分享卡片图片会被压缩，避免使用小字",
  ],
  guideUrl: "https://mp.weixin.qq.com",
};

export default wechatSpec;
