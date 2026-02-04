/**
 * @file taobao.ts
 * @description 淘宝平台规范
 * @module components/content-creator/canvas/poster/platforms/taobao
 */

import type { PlatformSpec } from "./types";

/**
 * 淘宝平台规范
 */
export const taobaoSpec: PlatformSpec = {
  id: "taobao",
  name: "淘宝",
  icon: "taobao",
  description: "淘宝商品主图、详情页、店铺装修规范",
  sizes: [
    {
      name: "商品主图 1:1",
      width: 800,
      height: 800,
      aspectRatio: "1:1",
      usage: "商品主图，搜索结果和商品页展示",
      recommended: true,
    },
    {
      name: "商品主图高清",
      width: 1500,
      height: 1500,
      aspectRatio: "1:1",
      usage: "高清商品主图，支持放大查看",
    },
    {
      name: "详情页头图",
      width: 750,
      height: 1000,
      aspectRatio: "3:4",
      usage: "详情页顶部展示图",
    },
    {
      name: "详情页长图",
      width: 750,
      height: 0, // 高度不限
      aspectRatio: "自适应",
      usage: "详情页内容图，宽度固定750",
    },
    {
      name: "店铺首页横幅",
      width: 1920,
      height: 600,
      aspectRatio: "16:5",
      usage: "店铺首页轮播横幅",
    },
    {
      name: "店铺首页海报",
      width: 750,
      height: 560,
      aspectRatio: "约4:3",
      usage: "店铺首页活动海报",
    },
    {
      name: "直通车创意图",
      width: 800,
      height: 800,
      aspectRatio: "1:1",
      usage: "直通车推广创意图",
    },
  ],
  safeZone: {
    top: 60,
    bottom: 60,
    left: 60,
    right: 60,
    description: "主图四周预留空间，避免被角标遮挡",
  },
  fileSpec: {
    formats: ["jpg", "png"],
    maxSizeKB: 3072, // 3MB
    recommendedDPI: 72,
    colorMode: "RGB",
  },
  textSpec: {
    minFontSize: 20,
    recommendedTitleSize: 40,
    recommendedBodySize: 28,
    lineHeightRatio: 1.4,
  },
  notes: [
    "主图不能有牛皮癣（过多促销文字）",
    "主图背景建议使用纯色或简洁背景",
    "详情页图片建议控制在15张以内",
    "避免使用极限词（最、第一等）",
    "主图会显示各种角标，预留空间",
    "建议主图文字占比不超过20%",
  ],
  guideUrl: "https://seller.taobao.com",
};

export default taobaoSpec;
