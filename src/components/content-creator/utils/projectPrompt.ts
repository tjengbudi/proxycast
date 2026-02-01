/**
 * 项目提示词生成工具
 *
 * 根据项目 Memory 生成系统提示词
 */

import type {
  ProjectMemory,
  Character,
  WorldBuilding,
  StyleGuide,
  OutlineNode,
} from "@/lib/api/memory";

/**
 * 生成角色提示词
 */
function generateCharactersPrompt(characters: Character[]): string {
  if (characters.length === 0) return "";

  let prompt = "### 角色设定\n\n";

  // 主要角色
  const mainCharacters = characters.filter((c) => c.is_main);
  const sideCharacters = characters.filter((c) => !c.is_main);

  if (mainCharacters.length > 0) {
    prompt += "**主要角色：**\n";
    mainCharacters.forEach((char) => {
      prompt += `- **${char.name}**`;
      if (char.aliases.length > 0) {
        prompt += `（${char.aliases.join("、")}）`;
      }
      prompt += "\n";
      if (char.description) {
        prompt += `  - 简介：${char.description}\n`;
      }
      if (char.personality) {
        prompt += `  - 性格：${char.personality}\n`;
      }
      if (char.background) {
        prompt += `  - 背景：${char.background}\n`;
      }
      if (char.appearance) {
        prompt += `  - 外貌：${char.appearance}\n`;
      }
    });
    prompt += "\n";
  }

  if (sideCharacters.length > 0) {
    prompt += "**次要角色：**\n";
    sideCharacters.forEach((char) => {
      prompt += `- **${char.name}**`;
      if (char.description) {
        prompt += `：${char.description}`;
      }
      prompt += "\n";
    });
    prompt += "\n";
  }

  return prompt;
}

/**
 * 生成世界观提示词
 */
function generateWorldBuildingPrompt(worldBuilding: WorldBuilding): string {
  let prompt = "### 世界观设定\n\n";

  if (worldBuilding.description) {
    prompt += `${worldBuilding.description}\n\n`;
  }

  if (worldBuilding.era) {
    prompt += `**时代背景：** ${worldBuilding.era}\n\n`;
  }

  if (worldBuilding.locations) {
    prompt += `**主要地点：** ${worldBuilding.locations}\n\n`;
  }

  if (worldBuilding.rules) {
    prompt += `**世界规则：** ${worldBuilding.rules}\n\n`;
  }

  return prompt;
}

/**
 * 生成风格指南提示词
 */
function generateStyleGuidePrompt(styleGuide: StyleGuide): string {
  let prompt = "### 写作风格\n\n";

  if (styleGuide.style) {
    prompt += `**风格：** ${styleGuide.style}\n\n`;
  }

  if (styleGuide.tone) {
    prompt += `**语调：** ${styleGuide.tone}\n\n`;
  }

  if (styleGuide.forbidden_words.length > 0) {
    prompt += `**禁用词汇：** ${styleGuide.forbidden_words.join("、")}\n\n`;
  }

  if (styleGuide.preferred_words.length > 0) {
    prompt += `**推荐词汇：** ${styleGuide.preferred_words.join("、")}\n\n`;
  }

  if (styleGuide.examples) {
    prompt += `**示例：**\n${styleGuide.examples}\n\n`;
  }

  return prompt;
}

/**
 * 生成大纲提示词
 */
function generateOutlinePrompt(outline: OutlineNode[]): string {
  if (outline.length === 0) return "";

  let prompt = "### 故事大纲\n\n";

  // 按 order 排序并构建层级结构
  const sortedOutline = [...outline].sort((a, b) => a.order - b.order);
  const rootNodes = sortedOutline.filter((n) => !n.parent_id);

  const renderNode = (node: OutlineNode, level: number = 0): string => {
    const indent = "  ".repeat(level);
    let result = `${indent}- **${node.title}**`;
    if (node.content) {
      result += `：${node.content}`;
    }
    result += "\n";

    // 查找子节点
    const children = sortedOutline.filter((n) => n.parent_id === node.id);
    children.forEach((child) => {
      result += renderNode(child, level + 1);
    });

    return result;
  };

  rootNodes.forEach((node) => {
    prompt += renderNode(node);
  });

  return prompt + "\n";
}

/**
 * 生成项目 Memory 提示词
 */
export function generateProjectMemoryPrompt(memory: ProjectMemory): string {
  let prompt = "## 项目背景\n\n";

  // 角色
  if (memory.characters.length > 0) {
    prompt += generateCharactersPrompt(memory.characters);
  }

  // 世界观
  if (memory.world_building?.description) {
    prompt += generateWorldBuildingPrompt(memory.world_building);
  }

  // 风格指南
  if (memory.style_guide?.style) {
    prompt += generateStyleGuidePrompt(memory.style_guide);
  }

  // 大纲
  if (memory.outline.length > 0) {
    prompt += generateOutlinePrompt(memory.outline);
  }

  return prompt;
}

/**
 * 判断主题是否为内容创作主题
 * 统一后，除了 general 以外都是内容创作主题
 */
export function isContentCreationTheme(theme: string): boolean {
  return theme !== "general";
}
