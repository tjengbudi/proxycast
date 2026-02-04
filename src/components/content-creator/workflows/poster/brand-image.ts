/**
 * @file brand-image.ts
 * @description 品牌形象海报工作流
 * @module components/content-creator/workflows/poster/brand-image
 */

import type { WorkflowTemplate, WorkflowStep } from "./types";

/**
 * 品牌形象工作流步骤
 */
const brandSteps: WorkflowStep[] = [
  {
    id: "requirement",
    name: "品牌分析",
    description: "分析品牌调性、核心价值和传播目标",
    agentId: "requirement",
    status: "pending",
    optional: false,
    estimatedDuration: 40,
    inputFields: [
      {
        key: "brandName",
        label: "品牌名称",
        type: "text",
        required: true,
      },
      {
        key: "brandSlogan",
        label: "品牌口号",
        type: "text",
        placeholder: "品牌 Slogan 或核心理念",
        required: false,
      },
      {
        key: "brandTone",
        label: "品牌调性",
        type: "select",
        options: [
          "高端奢华",
          "年轻活力",
          "专业可靠",
          "温馨亲切",
          "科技前沿",
          "自然环保",
        ],
        required: true,
      },
      {
        key: "communicationGoal",
        label: "传播目标",
        type: "select",
        options: ["品牌认知", "产品推广", "活动宣传", "理念传达", "招商加盟"],
        required: true,
      },
      {
        key: "targetAudience",
        label: "目标受众",
        type: "textarea",
        placeholder: "描述目标受众的特征、兴趣和需求",
        required: true,
      },
    ],
  },
  {
    id: "style",
    name: "风格定义",
    description: "基于品牌 VI 定义视觉风格",
    agentId: "style",
    status: "pending",
    optional: false,
    estimatedDuration: 30,
    inputFields: [
      {
        key: "primaryColor",
        label: "品牌主色",
        type: "color",
        required: false,
      },
      {
        key: "secondaryColor",
        label: "品牌辅色",
        type: "color",
        required: false,
      },
      {
        key: "fontStyle",
        label: "字体风格",
        type: "select",
        options: ["现代简约", "经典衬线", "手写温暖", "粗犷力量", "优雅纤细"],
        required: false,
      },
      {
        key: "visualStyle",
        label: "视觉风格",
        type: "select",
        options: ["扁平简约", "立体质感", "插画风格", "摄影写实", "几何抽象"],
        required: false,
      },
    ],
  },
  {
    id: "layout",
    name: "布局设计",
    description: "设计体现品牌气质的海报布局",
    agentId: "layout",
    status: "pending",
    optional: false,
    estimatedDuration: 50,
    inputFields: [
      {
        key: "layoutStyle",
        label: "布局风格",
        type: "select",
        options: ["中心对称", "黄金分割", "留白极简", "动态平衡", "网格系统"],
        required: false,
      },
      {
        key: "emphasis",
        label: "视觉重点",
        type: "select",
        options: ["品牌标志", "核心文案", "产品展示", "人物形象", "场景氛围"],
        required: true,
      },
    ],
  },
  {
    id: "content",
    name: "内容整合",
    description: "整合品牌元素和核心信息",
    agentId: "content",
    status: "pending",
    optional: false,
    estimatedDuration: 35,
    inputFields: [
      {
        key: "logo",
        label: "品牌 Logo",
        type: "image",
        required: true,
      },
      {
        key: "mainVisual",
        label: "主视觉图",
        type: "image",
        required: false,
      },
      {
        key: "headline",
        label: "主标题",
        type: "text",
        required: true,
      },
      {
        key: "subheadline",
        label: "副标题",
        type: "text",
        required: false,
      },
      {
        key: "bodyText",
        label: "正文内容",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    id: "refine",
    name: "精细调整",
    description: "优化品牌一致性和视觉平衡",
    agentId: "refine",
    status: "pending",
    optional: true,
    estimatedDuration: 25,
    inputFields: [],
  },
  {
    id: "export",
    name: "规范输出",
    description: "按品牌规范导出多种应用场景",
    agentId: "export",
    status: "pending",
    optional: false,
    estimatedDuration: 20,
    inputFields: [
      {
        key: "exportFormats",
        label: "导出场景",
        type: "multiselect",
        options: ["印刷物料", "户外广告", "线上展示", "社交媒体", "PPT/提案"],
        required: true,
      },
      {
        key: "colorMode",
        label: "色彩模式",
        type: "select",
        options: ["RGB (屏幕显示)", "CMYK (印刷)", "两者都要"],
        required: true,
      },
    ],
  },
];

/**
 * 品牌形象工作流模板
 */
export const brandImageWorkflow: WorkflowTemplate = {
  id: "brand-image",
  name: "品牌形象海报",
  description: "打造专业的品牌形象海报，传递品牌价值和调性",
  icon: "award",
  category: "branding",
  steps: brandSteps,
  defaultContext: {
    industry: "branding",
    style: "professional",
    colorTone: "brand-consistent",
  },
  suggestedDimensions: [
    { width: 1080, height: 1920, name: "竖版海报" },
    { width: 1920, height: 1080, name: "横版海报" },
    { width: 1080, height: 1080, name: "方形海报" },
    { width: 2480, height: 3508, name: "A4 印刷" },
  ],
  tags: ["品牌", "形象", "VI", "宣传"],
};

export default brandImageWorkflow;
