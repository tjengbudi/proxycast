/**
 * 风格指南面板
 *
 * 编辑项目的写作风格指南
 */

import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { RefreshCw, Save, FileEdit, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  StyleGuide,
  UpdateStyleGuideRequest,
  getStyleGuide,
  updateStyleGuide,
} from "@/lib/api/memory";
import { toast } from "sonner";

interface StyleGuidePanelProps {
  projectId: string;
}

interface FormData {
  style: string;
  tone: string;
  forbidden_words: string[];
  preferred_words: string[];
  examples: string;
}

const emptyFormData: FormData = {
  style: "",
  tone: "",
  forbidden_words: [],
  preferred_words: [],
  examples: "",
};

export function StyleGuidePanel({ projectId }: StyleGuidePanelProps) {
  const [_styleGuide, setStyleGuide] = useState<StyleGuide | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const loadStyleGuide = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStyleGuide(projectId);
      setStyleGuide(data);
      if (data) {
        setFormData({
          style: data.style || "",
          tone: data.tone || "",
          forbidden_words: data.forbidden_words || [],
          preferred_words: data.preferred_words || [],
          examples: data.examples || "",
        });
      } else {
        setFormData(emptyFormData);
      }
      setHasChanges(false);
    } catch (error) {
      console.error("加载风格指南失败:", error);
      toast.error("加载风格指南失败");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadStyleGuide();
  }, [loadStyleGuide]);

  const handleChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const request: UpdateStyleGuideRequest = {
        style: formData.style || undefined,
        tone: formData.tone || undefined,
        forbidden_words:
          formData.forbidden_words.length > 0
            ? formData.forbidden_words
            : undefined,
        preferred_words:
          formData.preferred_words.length > 0
            ? formData.preferred_words
            : undefined,
        examples: formData.examples || undefined,
      };
      const updated = await updateStyleGuide(projectId, request);
      setStyleGuide(updated);
      setHasChanges(false);
      toast.success("风格指南已保存");
    } catch (error) {
      console.error("保存风格指南失败:", error);
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileEdit className="h-4 w-4" />
          <span className="text-sm">风格指南</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadStyleGuide}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      {/* 表单 */}
      <div className="flex-1 overflow-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="style">写作风格</Label>
          <Textarea
            id="style"
            value={formData.style}
            onChange={(e) => handleChange("style", e.target.value)}
            placeholder="描述整体写作风格..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            描述整体的写作风格，如简洁明快、细腻抒情等
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">语气/调性</Label>
          <Textarea
            id="tone"
            value={formData.tone}
            onChange={(e) => handleChange("tone", e.target.value)}
            placeholder="描述语气和调性..."
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            描述文字的语气，如幽默、严肃、温暖等
          </p>
        </div>

        <div className="space-y-2">
          <Label>禁用词汇</Label>
          <TagInput
            value={formData.forbidden_words}
            onChange={(words) => handleChange("forbidden_words", words)}
            placeholder="输入后按回车添加"
          />
          <p className="text-xs text-muted-foreground">
            避免在写作中使用的词汇
          </p>
        </div>

        <div className="space-y-2">
          <Label>偏好词汇</Label>
          <TagInput
            value={formData.preferred_words}
            onChange={(words) => handleChange("preferred_words", words)}
            placeholder="输入后按回车添加"
          />
          <p className="text-xs text-muted-foreground">
            推荐在写作中使用的词汇
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="examples">示例文本</Label>
          <Textarea
            id="examples"
            value={formData.examples}
            onChange={(e) => handleChange("examples", e.target.value)}
            placeholder="提供一些符合风格的示例文本..."
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            提供一些符合风格的示例文本，帮助 AI 理解风格
          </p>
        </div>
      </div>

      {/* 状态提示 */}
      {hasChanges && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          有未保存的更改
        </div>
      )}
    </div>
  );
}

// 简单的标签输入组件
interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

function TagInput({
  value,
  onChange,
  placeholder = "输入后按回车添加",
  maxTags = 20,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[44px] focus-within:ring-2 focus-within:ring-ring">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-primary/80"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        disabled={value.length >= maxTags}
        className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm"
      />
      {inputValue && (
        <button
          type="button"
          onClick={addTag}
          className="p-1 hover:bg-primary/10 rounded"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
