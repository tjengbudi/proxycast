/**
 * @file ecommerce-promo.ts
 * @description 电商促销海报工作流
 * @module components/content-creator/workflows/poster/ecommerce-promo
 */

import type { WorkflowTemplate, WorkflowStep } from "./types";

/**
 * 电商促销工作流步骤
 */
const ecommerceSteps: WorkflowStep[] = [
  {
    id: "requirement",
    name: "需求分析",
    description: "分析促销活动类型、目标人群和营销目标",
    agentId: "requirement",
    status: "pending",
    optional: false,
    estimatedDuration: 30,
    inputFields: [
      {
        key: "promoType",
        label: "促销类型",
        type: "select",
        options: ["限时折扣", "满减活动", "新品上市", "清仓特卖", "节日促销"],
        required: true,
      },
      {
        key: "targetAudience",
        label: "目标人群",
        type: "text",
        placeholder: "例如：18-35岁女性，关注时尚美妆",
        required: true,
      },
      {
        key: "productInfo",
        label: "商品信息",
        type: "textarea",
        placeholder: "商品名称、原价、促销价、卖点等",
        required: true,
      },
      {
        key: "deadline",
        label: "活动时间",
        type: "text",
        placeholder: "例如：2024.1.1-1.7",
        required: false,
      },
    ],
  },
  {
    id: "style",
    name: "风格推荐",
    description: "基于促销类型推荐合适的视觉风格",
    agentId: "style",
    status: "pending",
    optional: false,
    estimatedDuration: 20,
    inputFields: [
      {
        key: "stylePreference",
        label: "风格偏好",
        type: "select",
        options: ["活力促销", "高端质感", "简约清新", "热闘氛围", "品牌调性"],
        required: false,
      },
    ],
  },
  {
    id: "layout",
    name: "布局生成",
    description: "生成适合电商平台的海报布局",
    agentId: "layout",
    status: "pending",
    optional: false,
    estimatedDuration: 45,
    inputFields: [
      {
        key: "platform",
        label: "目标平台",
        type: "select",
        options: ["淘宝", "京东", "拼多多", "小红书", "抖音"],
        required: true,
      },
      {
        key: "layoutType",
        label: "布局类型",
        type: "select",
        options: ["商品主图", "活动海报", "详情页头图", "店铺首页"],
        required: true,
      },
    ],
  },
  {
    id: "content",
    name: "内容填充",
    description: "填充商品图片、促销文案和价格信息",
    agentId: "content",
    status: "pending",
    optional: false,
    estimatedDuration: 30,
    inputFields: [
      {
        key: "productImage",
        label: "商品图片",
        type: "image",
        required: true,
      },
      {
        key: "originalPrice",
        label: "原价",
        type: "text",
        placeholder: "¥199",
        required: false,
      },
      {
        key: "promoPrice",
        label: "促销价",
        type: "text",
        placeholder: "¥99",
        required: true,
      },
      {
        key: "ctaText",
        label: "行动号召",
        type: "text",
        placeholder: "立即抢购",
        required: false,
      },
    ],
  },
  {
    id: "refine",
    name: "优化调整",
    description: "优化视觉层次和转化引导",
    agentId: "refine",
    status: "pending",
    optional: true,
    estimatedDuration: 20,
    inputFields: [],
  },
  {
    id: "export",
    name: "导出发布",
    description: "导出适合各电商平台的尺寸格式",
    agentId: "export",
    status: "pending",
    optional: false,
    estimatedDuration: 15,
    inputFields: [
      {
        key: "exportPlatforms",
        label: "导出平台",
        type: "multiselect",
        options: ["淘宝主图", "京东主图", "拼多多主图", "详情页", "店铺装修"],
        required: true,
      },
    ],
  },
];

/**
 * 电商促销工作流模板
 */
export const ecommercePromoWorkflow: WorkflowTemplate = {
  id: "ecommerce-promo",
  name: "电商促销海报",
  description: "快速制作高转化的电商促销海报，支持多平台尺寸",
  icon: "shopping-cart",
  category: "ecommerce",
  steps: ecommerceSteps,
  defaultContext: {
    industry: "ecommerce",
    style: "promotional",
    colorTone: "vibrant",
  },
  suggestedDimensions: [
    { width: 800, height: 800, name: "淘宝主图" },
    { width: 750, height: 1000, name: "详情页头图" },
    { width: 800, height: 1200, name: "活动海报" },
  ],
  tags: ["电商", "促销", "卖货", "转化"],
};

export default ecommercePromoWorkflow;
