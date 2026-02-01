/**
 * @file useWorkflow Hook
 * @description 工作流步骤状态管理 Hook
 * @module components/content-creator/hooks/useWorkflow
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ThemeType,
  CreationMode,
  WorkflowStep,
  StepDefinition,
  StepResult,
  StepStatus,
} from "../types";

/**
 * 获取音乐创作工作流步骤
 * 参考 Musicify MVP 的步骤设计
 */
function getMusicWorkflowSteps(mode: CreationMode): StepDefinition[] {
  // 快速模式：3 步骤（明确需求 → 生成歌词 → 导出）
  if (mode === "fast") {
    return [
      {
        id: "spec",
        type: "clarify",
        title: "明确需求",
        description: "定义歌曲主题、风格和情感",
        aiTask: { taskType: "spec", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: true },
      },
      {
        id: "lyrics",
        type: "write",
        title: "生成歌词",
        description: "AI 生成完整歌词",
        aiTask: { taskType: "lyrics", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: false },
      },
      {
        id: "export",
        type: "adapt",
        title: "导出",
        description: "导出到 Suno/Udio 等平台",
        aiTask: { taskType: "export", streaming: true },
        behavior: { skippable: true, redoable: true, autoAdvance: false },
      },
    ];
  }

  // 引导模式：完整 7 步骤
  return [
    {
      id: "spec",
      type: "clarify",
      title: "歌曲规格",
      description: "定义歌曲类型、时长、风格",
      aiTask: { taskType: "spec", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: true },
    },
    {
      id: "theme",
      type: "research",
      title: "主题构思",
      description: "引导思考核心主题和故事",
      aiTask: { taskType: "theme", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "mood",
      type: "research",
      title: "情绪定位",
      description: "确定情绪氛围（温暖/激昂/治愈等）",
      aiTask: { taskType: "mood", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "structure",
      type: "outline",
      title: "结构设计",
      description: "设计歌曲结构（主歌/副歌/桥段）",
      aiTask: { taskType: "structure", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "lyrics",
      type: "write",
      title: "歌词创作",
      description: "创作完整歌词",
      aiTask: { taskType: "lyrics", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "polish",
      type: "polish",
      title: "润色优化",
      description: "押韵检查和歌词润色",
      aiTask: { taskType: "polish", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "export",
      type: "adapt",
      title: "导出",
      description: "导出到 Suno/Udio 等平台",
      aiTask: { taskType: "export", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
  ];
}

/**
 * 获取社媒内容创作工作流步骤
 */
function getSocialMediaWorkflowSteps(mode: CreationMode): StepDefinition[] {
  // 快速模式：3 步骤（明确需求 → 生成内容 → 平台适配）
  if (mode === "fast") {
    return [
      {
        id: "brief",
        type: "clarify",
        title: "明确需求",
        description: "定义内容主题、平台和风格",
        aiTask: { taskType: "brief", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: true },
      },
      {
        id: "create",
        type: "write",
        title: "生成内容",
        description: "AI 生成社媒内容",
        aiTask: { taskType: "create", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: false },
      },
      {
        id: "adapt",
        type: "adapt",
        title: "平台适配",
        description: "适配目标平台格式",
        aiTask: { taskType: "adapt", streaming: true },
        behavior: { skippable: true, redoable: true, autoAdvance: false },
      },
    ];
  }

  // 引导模式：4 步骤
  return [
    {
      id: "brief",
      type: "clarify",
      title: "明确需求",
      description: "定义内容主题、目标受众和平台",
      aiTask: { taskType: "brief", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: true },
    },
    {
      id: "create",
      type: "write",
      title: "创作内容",
      description: "AI 生成社媒文案",
      aiTask: { taskType: "create", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "polish",
      type: "polish",
      title: "润色优化",
      description: "优化文案表达和吸引力",
      aiTask: { taskType: "polish", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "adapt",
      type: "adapt",
      title: "平台适配",
      description: "适配不同平台的格式要求",
      aiTask: { taskType: "adapt", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
  ];
}

/**
 * 获取视频脚本创作工作流步骤
 */
function getVideoWorkflowSteps(mode: CreationMode): StepDefinition[] {
  // 快速模式：3 步骤（明确需求 → 生成剧本 → 润色优化）
  if (mode === "fast") {
    return [
      {
        id: "brief",
        type: "clarify",
        title: "明确需求",
        description: "定义视频主题、时长和风格",
        aiTask: { taskType: "brief", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: true },
      },
      {
        id: "script",
        type: "write",
        title: "生成剧本",
        description: "AI 生成视频脚本",
        aiTask: { taskType: "script", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: false },
      },
      {
        id: "polish",
        type: "polish",
        title: "润色优化",
        description: "优化剧本内容",
        aiTask: { taskType: "polish", streaming: true },
        behavior: { skippable: true, redoable: true, autoAdvance: false },
      },
    ];
  }

  // 引导模式：5 步骤
  return [
    {
      id: "brief",
      type: "clarify",
      title: "明确需求",
      description: "定义视频主题、时长和目标受众",
      aiTask: { taskType: "brief", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: true },
    },
    {
      id: "outline",
      type: "outline",
      title: "剧情大纲",
      description: "规划视频整体结构和节奏",
      aiTask: { taskType: "outline", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "storyboard",
      type: "research",
      title: "分镜设计",
      description: "设计关键画面和镜头",
      aiTask: { taskType: "storyboard", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "script",
      type: "write",
      title: "撰写剧本",
      description: "撰写完整视频脚本",
      aiTask: { taskType: "script", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "polish",
      type: "polish",
      title: "润色优化",
      description: "优化台词和节奏",
      aiTask: { taskType: "polish", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
  ];
}

/**
 * 获取小说创作工作流步骤
 */
function getNovelWorkflowSteps(mode: CreationMode): StepDefinition[] {
  // 快速模式：3 步骤（明确需求 → 生成章节 → 润色优化）
  if (mode === "fast") {
    return [
      {
        id: "brief",
        type: "clarify",
        title: "明确需求",
        description: "定义故事主题、类型和风格",
        aiTask: { taskType: "brief", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: true },
      },
      {
        id: "write",
        type: "write",
        title: "生成章节",
        description: "AI 生成小说内容",
        aiTask: { taskType: "write", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: false },
      },
      {
        id: "polish",
        type: "polish",
        title: "润色优化",
        description: "优化文笔和情节",
        aiTask: { taskType: "polish", streaming: true },
        behavior: { skippable: true, redoable: true, autoAdvance: false },
      },
    ];
  }

  // 引导模式：5 步骤
  return [
    {
      id: "brief",
      type: "clarify",
      title: "明确需求",
      description: "定义故事主题、类型和目标读者",
      aiTask: { taskType: "brief", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: true },
    },
    {
      id: "outline",
      type: "outline",
      title: "章节大纲",
      description: "规划故事结构和章节",
      aiTask: { taskType: "outline", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "character",
      type: "research",
      title: "角色设定",
      description: "设计主要角色和背景",
      aiTask: { taskType: "character", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "write",
      type: "write",
      title: "撰写内容",
      description: "撰写小说章节",
      aiTask: { taskType: "write", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "polish",
      type: "polish",
      title: "润色优化",
      description: "优化文笔和情节连贯性",
      aiTask: { taskType: "polish", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
  ];
}

/**
 * 获取文档创作工作流步骤
 */
function getDocumentWorkflowSteps(mode: CreationMode): StepDefinition[] {
  // 快速模式：3 步骤（明确需求 → 生成文档 → 润色优化）
  if (mode === "fast") {
    return [
      {
        id: "brief",
        type: "clarify",
        title: "明确需求",
        description: "定义文档主题、类型和受众",
        aiTask: { taskType: "brief", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: true },
      },
      {
        id: "write",
        type: "write",
        title: "生成文档",
        description: "AI 生成文档内容",
        aiTask: { taskType: "write", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: false },
      },
      {
        id: "polish",
        type: "polish",
        title: "润色优化",
        description: "优化文档结构和表达",
        aiTask: { taskType: "polish", streaming: true },
        behavior: { skippable: true, redoable: true, autoAdvance: false },
      },
    ];
  }

  // 引导模式：4 步骤
  return [
    {
      id: "brief",
      type: "clarify",
      title: "明确需求",
      description: "定义文档主题、类型和目标读者",
      aiTask: { taskType: "brief", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: true },
    },
    {
      id: "outline",
      type: "outline",
      title: "文档大纲",
      description: "规划文档结构和章节",
      aiTask: { taskType: "outline", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "write",
      type: "write",
      title: "撰写内容",
      description: "撰写文档正文",
      aiTask: { taskType: "write", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "polish",
      type: "polish",
      title: "润色优化",
      description: "优化结构和语言表达",
      aiTask: { taskType: "polish", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
  ];
}

/**
 * 获取海报创作工作流步骤
 */
function getPosterWorkflowSteps(mode: CreationMode): StepDefinition[] {
  // 快速模式：3 步骤（明确需求 → 生成设计 → 导出）
  if (mode === "fast") {
    return [
      {
        id: "brief",
        type: "clarify",
        title: "明确需求",
        description: "定义海报主题、尺寸和风格",
        aiTask: { taskType: "brief", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: true },
      },
      {
        id: "design",
        type: "write",
        title: "生成设计",
        description: "AI 生成海报设计方案",
        aiTask: { taskType: "design", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: false },
      },
      {
        id: "export",
        type: "adapt",
        title: "导出",
        description: "导出为图片或 PDF",
        aiTask: { taskType: "export", streaming: true },
        behavior: { skippable: true, redoable: true, autoAdvance: false },
      },
    ];
  }

  // 引导模式：5 步骤
  return [
    {
      id: "brief",
      type: "clarify",
      title: "需求分析",
      description: "明确海报目的、受众和场景",
      aiTask: { taskType: "brief", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: true },
    },
    {
      id: "copywriting",
      type: "research",
      title: "文案策划",
      description: "撰写海报标题和文案",
      aiTask: { taskType: "copywriting", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "layout",
      type: "outline",
      title: "布局设计",
      description: "规划视觉层次和元素布局",
      aiTask: { taskType: "layout", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "design",
      type: "write",
      title: "视觉设计",
      description: "生成完整海报设计",
      aiTask: { taskType: "design", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "export",
      type: "adapt",
      title: "导出",
      description: "导出为图片或 PDF",
      aiTask: { taskType: "export", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
  ];
}

/**
 * 获取主题对应的工作流步骤
 * 导出供测试使用
 */
export function getWorkflowSteps(
  theme: ThemeType,
  mode: CreationMode,
): StepDefinition[] {
  switch (theme) {
    // 不显示进度条的类型
    case "general":
    case "knowledge":
    case "planning":
      return [];

    // 有专用工作流的类型
    case "music":
      return getMusicWorkflowSteps(mode);
    case "poster":
      return getPosterWorkflowSteps(mode);
    case "social-media":
      return getSocialMediaWorkflowSteps(mode);
    case "video":
      return getVideoWorkflowSteps(mode);
    case "novel":
      return getNovelWorkflowSteps(mode);
    case "document":
      return getDocumentWorkflowSteps(mode);

    // 未知类型不显示进度条
    default:
      return [];
  }
}

/**
 * 工作流状态管理 Hook
 */
export function useWorkflow(theme: ThemeType, mode: CreationMode) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // 根据主题和模式初始化步骤
  useEffect(() => {
    const definitions = getWorkflowSteps(theme, mode);
    const initialSteps: WorkflowStep[] = definitions.map((def, index) => ({
      ...def,
      status: index === 0 ? "active" : "pending",
    }));
    setSteps(initialSteps);
    setCurrentStepIndex(0);
  }, [theme, mode]);

  /**
   * 当前步骤
   */
  const currentStep = useMemo(
    () => steps[currentStepIndex] || null,
    [steps, currentStepIndex],
  );

  /**
   * 进度百分比
   */
  const progress = useMemo(() => {
    if (steps.length === 0) return 0;
    const completedCount = steps.filter(
      (s) => s.status === "completed" || s.status === "skipped",
    ).length;
    return Math.round((completedCount / steps.length) * 100);
  }, [steps]);

  /**
   * 跳转到指定步骤
   */
  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        // 只能跳转到已完成或当前步骤
        const targetStep = steps[index];
        if (
          targetStep.status === "completed" ||
          targetStep.status === "skipped" ||
          index === currentStepIndex
        ) {
          setCurrentStepIndex(index);
          setSteps((prev) =>
            prev.map((step, i) =>
              i === index ? { ...step, status: "active" as StepStatus } : step,
            ),
          );
        }
      }
    },
    [steps, currentStepIndex],
  );

  /**
   * 完成当前步骤
   */
  const completeStep = useCallback(
    (result: StepResult) => {
      // 使用函数式更新来获取最新的状态
      // 这样即使 AI 快速连续生成多个文件，也能正确推进步骤
      setCurrentStepIndex((prevIndex) => {
        // 标记当前步骤为完成
        setSteps((prev) =>
          prev.map((step, i) =>
            i === prevIndex
              ? { ...step, status: "completed" as StepStatus, result }
              : step,
          ),
        );

        // 计算下一步索引
        const nextIndex = prevIndex + 1;
        if (nextIndex < steps.length) {
          // 激活下一步
          setSteps((prev) =>
            prev.map((step, i) =>
              i === nextIndex
                ? { ...step, status: "active" as StepStatus }
                : step,
            ),
          );
          return nextIndex;
        }
        return prevIndex;
      });
    },
    [steps.length],
  );

  /**
   * 跳过当前步骤
   */
  const skipStep = useCallback(() => {
    const step = steps[currentStepIndex];
    if (!step?.behavior.skippable) return;

    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStepIndex ? { ...s, status: "skipped" as StepStatus } : s,
      ),
    );

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStepIndex(nextIndex);
      setSteps((prev) =>
        prev.map((step, i) =>
          i === nextIndex ? { ...step, status: "active" as StepStatus } : step,
        ),
      );
    }
  }, [currentStepIndex, steps]);

  /**
   * 重做指定步骤
   */
  const redoStep = useCallback(
    (index: number) => {
      const step = steps[index];
      if (!step?.behavior.redoable) return;

      // 重置该步骤及之后的所有步骤
      setSteps((prev) =>
        prev.map((s, i) => {
          if (i === index) {
            return { ...s, status: "active" as StepStatus, result: undefined };
          }
          if (i > index) {
            return { ...s, status: "pending" as StepStatus, result: undefined };
          }
          return s;
        }),
      );
      setCurrentStepIndex(index);
    },
    [steps],
  );

  /**
   * 提交步骤表单
   */
  const submitStepForm = useCallback(
    (data: Record<string, unknown>) => {
      completeStep({ userInput: data });
    },
    [completeStep],
  );

  return {
    steps,
    currentStep,
    currentStepIndex,
    progress,
    canGoBack: currentStepIndex > 0,
    canGoForward: currentStepIndex < steps.length - 1,
    goToStep,
    completeStep,
    skipStep,
    redoStep,
    submitStepForm,
  };
}
