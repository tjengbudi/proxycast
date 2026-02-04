/**
 * @file BrandPersonaDialog.tsx
 * @description 品牌人设编辑对话框组件，支持分步骤创建品牌人设
 * @module components/projects/dialogs/BrandPersonaDialog
 */

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  SaveIcon,
  Loader2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  BrandPersona,
  BrandTone,
  DesignConfig,
  ColorScheme,
  Typography,
  BrandPersonality,
  DesignStyle,
  CreateBrandExtensionRequest,
  BrandPersonaTemplate,
} from "@/types/brand-persona";
import {
  BRAND_PERSONALITY_NAMES,
  BRAND_PERSONALITY_DESCRIPTIONS,
  DESIGN_STYLE_NAMES,
  PRESET_COLOR_SCHEMES,
  AVAILABLE_FONTS,
  DEFAULT_DESIGN_CONFIG,
} from "@/types/brand-persona";

export interface BrandPersonaDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onOpenChange: (open: boolean) => void;
  /** 人设 ID */
  personaId: string;
  /** 人设名称 */
  personaName: string;
  /** 现有品牌人设（编辑时传入） */
  brandPersona?: BrandPersona | null;
  /** 模板列表 */
  templates?: BrandPersonaTemplate[];
  /** 保存回调 */
  onSave: (req: CreateBrandExtensionRequest) => Promise<void>;
}

/** 步骤定义 */
const STEPS = [
  { id: 1, name: "品牌调性", key: "brandTone" },
  { id: 2, name: "配色方案", key: "colorScheme" },
  { id: 3, name: "字体设置", key: "typography" },
  { id: 4, name: "预览确认", key: "preview" },
];

/**
 * 品牌人设编辑对话框
 */
export function BrandPersonaDialog({
  open,
  onOpenChange,
  personaId,
  personaName,
  brandPersona,
  templates = [],
  onSave,
}: BrandPersonaDialogProps) {
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  // 品牌调性状态
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [personality, setPersonality] =
    useState<BrandPersonality>("professional");
  const [voiceTone, setVoiceTone] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  // 设计配置状态
  const [primaryStyle, setPrimaryStyle] = useState<DesignStyle>("modern");
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    DEFAULT_DESIGN_CONFIG.colorScheme,
  );

  // 字体配置状态
  const [typography, setTypography] = useState<Typography>(
    DEFAULT_DESIGN_CONFIG.typography,
  );

  const isEditing = !!brandPersona?.brandTone;

  // 同步编辑数据
  useEffect(() => {
    if (open) {
      if (brandPersona?.brandTone) {
        // 编辑模式：加载现有数据
        setKeywords(brandPersona.brandTone.keywords || []);
        setPersonality(brandPersona.brandTone.personality || "professional");
        setVoiceTone(brandPersona.brandTone.voiceTone || "");
        setTargetAudience(brandPersona.brandTone.targetAudience || "");

        if (brandPersona.design) {
          setPrimaryStyle(brandPersona.design.primaryStyle || "modern");
          setColorScheme(
            brandPersona.design.colorScheme ||
              DEFAULT_DESIGN_CONFIG.colorScheme,
          );
          setTypography(
            brandPersona.design.typography || DEFAULT_DESIGN_CONFIG.typography,
          );
        }
      } else {
        // 新建模式：重置表单
        setKeywords([]);
        setKeywordInput("");
        setPersonality("professional");
        setVoiceTone("");
        setTargetAudience("");
        setPrimaryStyle("modern");
        setColorScheme(DEFAULT_DESIGN_CONFIG.colorScheme);
        setTypography(DEFAULT_DESIGN_CONFIG.typography);
      }
      setStep(1);
    }
  }, [brandPersona, open]);

  // 添加关键词
  const handleAddKeyword = useCallback(() => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  }, [keywordInput, keywords]);

  // 删除关键词
  const handleRemoveKeyword = useCallback(
    (keyword: string) => {
      setKeywords(keywords.filter((k) => k !== keyword));
    },
    [keywords],
  );

  // 应用模板
  const handleApplyTemplate = useCallback((template: BrandPersonaTemplate) => {
    setKeywords(template.brandTone.keywords || []);
    setPersonality(template.brandTone.personality || "professional");
    setVoiceTone(template.brandTone.voiceTone || "");
    setTargetAudience(template.brandTone.targetAudience || "");
    setPrimaryStyle(template.design.primaryStyle || "modern");
    setColorScheme(
      template.design.colorScheme || DEFAULT_DESIGN_CONFIG.colorScheme,
    );
    setTypography(
      template.design.typography || DEFAULT_DESIGN_CONFIG.typography,
    );
    toast.success(`已应用模板: ${template.name}`);
  }, []);

  // 应用预设配色
  const handleApplyPresetColor = useCallback(
    (preset: (typeof PRESET_COLOR_SCHEMES)[0]) => {
      setColorScheme(preset.colors);
    },
    [],
  );

  // 保存
  const handleSave = async () => {
    setSaving(true);
    try {
      const brandTone: BrandTone = {
        keywords,
        personality,
        voiceTone: voiceTone || undefined,
        targetAudience: targetAudience || undefined,
      };

      const design: DesignConfig = {
        primaryStyle,
        colorScheme,
        typography,
      };

      await onSave({
        personaId,
        brandTone,
        design,
      });

      toast.success(isEditing ? "品牌人设已更新" : "品牌人设已创建");
      onOpenChange(false);
    } catch (error) {
      toast.error(String(error) || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 渲染步骤 1：品牌调性
  const renderBrandToneStep = () => (
    <div className="space-y-4">
      {/* 模板选择 */}
      {templates.length > 0 && (
        <div className="space-y-2">
          <Label>快速应用模板</Label>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => handleApplyTemplate(template)}
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 品牌关键词 */}
      <div className="space-y-2">
        <Label>品牌关键词</Label>
        <div className="flex gap-2">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="输入关键词后按回车"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddKeyword();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={handleAddKeyword}>
            添加
          </Button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 品牌个性 */}
      <div className="space-y-2">
        <Label>品牌个性</Label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(BRAND_PERSONALITY_NAMES) as BrandPersonality[]).map(
            (p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPersonality(p)}
                className={cn(
                  "p-3 border rounded-lg text-left transition-colors",
                  personality === p
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/10",
                )}
              >
                <div className="font-medium text-sm">
                  {BRAND_PERSONALITY_NAMES[p]}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {BRAND_PERSONALITY_DESCRIPTIONS[p]}
                </div>
              </button>
            ),
          )}
        </div>
      </div>

      {/* 品牌语调 */}
      <div className="space-y-2">
        <Label htmlFor="voice-tone">品牌语调</Label>
        <Input
          id="voice-tone"
          value={voiceTone}
          onChange={(e) => setVoiceTone(e.target.value)}
          placeholder="例如：专业但不刻板，友好但不随意"
        />
      </div>

      {/* 目标受众 */}
      <div className="space-y-2">
        <Label htmlFor="target-audience">目标受众</Label>
        <Textarea
          id="target-audience"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="描述你的目标用户，如：25-35岁的都市女性，追求品质生活..."
          rows={2}
        />
      </div>
    </div>
  );

  // 渲染步骤 2：配色方案
  const renderColorSchemeStep = () => (
    <div className="space-y-4">
      {/* 设计风格 */}
      <div className="space-y-2">
        <Label>设计风格</Label>
        <Select
          value={primaryStyle}
          onValueChange={(v) => setPrimaryStyle(v as DesignStyle)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DESIGN_STYLE_NAMES) as DesignStyle[]).map((style) => (
              <SelectItem key={style} value={style}>
                {DESIGN_STYLE_NAMES[style]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 预设配色 */}
      <div className="space-y-2">
        <Label>预设配色方案</Label>
        <div className="flex flex-wrap gap-3">
          {PRESET_COLOR_SCHEMES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPresetColor(preset)}
              className="text-center"
            >
              <div className="flex rounded-lg overflow-hidden mb-1 border">
                <div
                  className="w-6 h-6"
                  style={{ backgroundColor: preset.colors.primary }}
                />
                <div
                  className="w-6 h-6"
                  style={{ backgroundColor: preset.colors.secondary }}
                />
                <div
                  className="w-6 h-6"
                  style={{ backgroundColor: preset.colors.accent }}
                />
                <div
                  className="w-6 h-6"
                  style={{ backgroundColor: preset.colors.background }}
                />
              </div>
              <span className="text-xs">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 自定义配色 */}
      <div className="space-y-2">
        <Label>自定义配色</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "primary" as const, label: "主色" },
            { key: "secondary" as const, label: "辅色" },
            { key: "accent" as const, label: "强调色" },
            { key: "background" as const, label: "背景色" },
            { key: "text" as const, label: "主文字" },
            { key: "textSecondary" as const, label: "次要文字" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="color"
                value={colorScheme[key]}
                onChange={(e) =>
                  setColorScheme({ ...colorScheme, [key]: e.target.value })
                }
                className="w-8 h-8 rounded cursor-pointer border"
              />
              <div>
                <div className="text-xs font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">
                  {colorScheme[key]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 配色预览 */}
      <div className="space-y-2">
        <Label>配色预览</Label>
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: colorScheme.background }}
        >
          <h3
            style={{
              color: colorScheme.primary,
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            标题示例
          </h3>
          <p
            style={{
              color: colorScheme.text,
              marginTop: "4px",
              fontSize: "14px",
            }}
          >
            这是正文内容示例，展示主要文字颜色。
          </p>
          <p
            style={{
              color: colorScheme.textSecondary,
              marginTop: "2px",
              fontSize: "12px",
            }}
          >
            这是次要文字内容示例。
          </p>
          <button
            type="button"
            style={{
              backgroundColor: colorScheme.accent,
              color: "#FFFFFF",
              padding: "6px 12px",
              borderRadius: "4px",
              marginTop: "8px",
              fontSize: "12px",
            }}
          >
            行动按钮
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染步骤 3：字体设置
  const renderTypographyStep = () => (
    <div className="space-y-4">
      {/* 标题字体 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>标题字体</Label>
          <Select
            value={typography.titleFont}
            onValueChange={(v) =>
              setTypography({ ...typography, titleFont: v })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_FONTS.map((font) => (
                <SelectItem key={font.id} value={font.name}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>正文字体</Label>
          <Select
            value={typography.bodyFont}
            onValueChange={(v) => setTypography({ ...typography, bodyFont: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_FONTS.map((font) => (
                <SelectItem key={font.id} value={font.name}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 字号设置 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>标题字号: {typography.titleSize}px</Label>
          <Slider
            value={[typography.titleSize]}
            onValueChange={([v]) =>
              setTypography({ ...typography, titleSize: v })
            }
            min={48}
            max={120}
            step={4}
          />
        </div>

        <div className="space-y-2">
          <Label>正文字号: {typography.bodySize}px</Label>
          <Slider
            value={[typography.bodySize]}
            onValueChange={([v]) =>
              setTypography({ ...typography, bodySize: v })
            }
            min={14}
            max={36}
            step={2}
          />
        </div>
      </div>

      {/* 字重设置 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>标题字重</Label>
          <Select
            value={String(typography.titleWeight)}
            onValueChange={(v) =>
              setTypography({ ...typography, titleWeight: Number(v) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="400">Regular (400)</SelectItem>
              <SelectItem value="500">Medium (500)</SelectItem>
              <SelectItem value="600">SemiBold (600)</SelectItem>
              <SelectItem value="700">Bold (700)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>正文字重</Label>
          <Select
            value={String(typography.bodyWeight)}
            onValueChange={(v) =>
              setTypography({ ...typography, bodyWeight: Number(v) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="300">Light (300)</SelectItem>
              <SelectItem value="400">Regular (400)</SelectItem>
              <SelectItem value="500">Medium (500)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 字体预览 */}
      <div className="space-y-2">
        <Label>字体预览</Label>
        <div className="p-4 border rounded-lg bg-white">
          <h2
            style={{
              fontFamily: typography.titleFont,
              fontWeight: typography.titleWeight,
              fontSize: `${Math.min(typography.titleSize, 48)}px`,
              lineHeight: typography.lineHeight,
            }}
          >
            标题文字示例
          </h2>
          <p
            style={{
              fontFamily: typography.bodyFont,
              fontWeight: typography.bodyWeight,
              fontSize: `${typography.bodySize}px`,
              lineHeight: typography.lineHeight,
              marginTop: "8px",
            }}
          >
            这是正文内容示例，用于展示正文字体效果。
            好的字体搭配能够提升设计的专业感和可读性。
          </p>
        </div>
      </div>
    </div>
  );

  // 渲染步骤 4：预览确认
  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        请确认以下品牌人设配置：
      </div>

      {/* 品牌调性预览 */}
      <div className="p-3 border rounded-lg space-y-2">
        <div className="font-medium">品牌调性</div>
        <div className="text-sm space-y-1">
          <div>
            <span className="text-muted-foreground">关键词：</span>
            {keywords.length > 0 ? keywords.join("、") : "未设置"}
          </div>
          <div>
            <span className="text-muted-foreground">品牌个性：</span>
            {BRAND_PERSONALITY_NAMES[personality]}
          </div>
          {voiceTone && (
            <div>
              <span className="text-muted-foreground">品牌语调：</span>
              {voiceTone}
            </div>
          )}
          {targetAudience && (
            <div>
              <span className="text-muted-foreground">目标受众：</span>
              {targetAudience}
            </div>
          )}
        </div>
      </div>

      {/* 设计配置预览 */}
      <div className="p-3 border rounded-lg space-y-2">
        <div className="font-medium">设计配置</div>
        <div className="text-sm space-y-1">
          <div>
            <span className="text-muted-foreground">设计风格：</span>
            {DESIGN_STYLE_NAMES[primaryStyle]}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">配色方案：</span>
            <div className="flex rounded overflow-hidden border">
              <div
                className="w-4 h-4"
                style={{ backgroundColor: colorScheme.primary }}
              />
              <div
                className="w-4 h-4"
                style={{ backgroundColor: colorScheme.secondary }}
              />
              <div
                className="w-4 h-4"
                style={{ backgroundColor: colorScheme.accent }}
              />
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">标题字体：</span>
            {typography.titleFont} ({typography.titleSize}px)
          </div>
          <div>
            <span className="text-muted-foreground">正文字体：</span>
            {typography.bodyFont} ({typography.bodySize}px)
          </div>
        </div>
      </div>

      {/* 综合预览 */}
      <div className="space-y-2">
        <div className="font-medium">综合预览</div>
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: colorScheme.background }}
        >
          <h3
            style={{
              fontFamily: typography.titleFont,
              fontWeight: typography.titleWeight,
              fontSize: `${Math.min(typography.titleSize, 36)}px`,
              color: colorScheme.primary,
              lineHeight: typography.lineHeight,
            }}
          >
            {personaName}
          </h3>
          <p
            style={{
              fontFamily: typography.bodyFont,
              fontWeight: typography.bodyWeight,
              fontSize: `${typography.bodySize}px`,
              color: colorScheme.text,
              lineHeight: typography.lineHeight,
              marginTop: "8px",
            }}
          >
            {keywords.length > 0
              ? `品牌关键词：${keywords.join("、")}`
              : "这是一段示例正文内容，展示品牌人设的整体视觉效果。"}
          </p>
          <p
            style={{
              fontFamily: typography.bodyFont,
              fontSize: `${typography.bodySize - 2}px`,
              color: colorScheme.textSecondary,
              marginTop: "4px",
            }}
          >
            {BRAND_PERSONALITY_NAMES[personality]} ·{" "}
            {DESIGN_STYLE_NAMES[primaryStyle]}
          </p>
        </div>
      </div>
    </div>
  );

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderBrandToneStep();
      case 2:
        return renderColorSchemeStep();
      case 3:
        return renderTypographyStep();
      case 4:
        return renderPreviewStep();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "编辑品牌人设" : "创建品牌人设"} - {personaName}
          </DialogTitle>
        </DialogHeader>

        {/* 步骤指示器 */}
        <div className="flex border-b pb-3">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "flex-1 text-center text-sm",
                step === s.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "inline-block w-6 h-6 rounded-full text-xs leading-6 mr-1",
                  step > s.id
                    ? "bg-green-500 text-white"
                    : step === s.id
                      ? "bg-primary text-white"
                      : "bg-muted/20",
                )}
              >
                {step > s.id ? "✓" : s.id}
              </span>
              {s.name}
            </div>
          ))}
        </div>

        {/* 步骤内容 */}
        <div className="py-4 min-h-[300px]">{renderStepContent()}</div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                上一步
              </Button>
            )}
            {step < STEPS.length ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                下一步
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2Icon className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4 mr-1" />
                )}
                {saving ? "保存中..." : "完成创建"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BrandPersonaDialog;
