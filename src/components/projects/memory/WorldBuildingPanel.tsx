/**
 * 世界观编辑面板
 *
 * 编辑项目的世界观设定
 */

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Save, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  WorldBuilding,
  UpdateWorldBuildingRequest,
  getWorldBuilding,
  updateWorldBuilding,
} from "@/lib/api/memory";
import { toast } from "sonner";

interface WorldBuildingPanelProps {
  projectId: string;
}

interface FormData {
  description: string;
  era: string;
  locations: string;
  rules: string;
}

const emptyFormData: FormData = {
  description: "",
  era: "",
  locations: "",
  rules: "",
};

export function WorldBuildingPanel({ projectId }: WorldBuildingPanelProps) {
  const [_worldBuilding, setWorldBuilding] = useState<WorldBuilding | null>(
    null,
  );
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const loadWorldBuilding = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWorldBuilding(projectId);
      setWorldBuilding(data);
      if (data) {
        setFormData({
          description: data.description || "",
          era: data.era || "",
          locations: data.locations || "",
          rules: data.rules || "",
        });
      } else {
        setFormData(emptyFormData);
      }
      setHasChanges(false);
    } catch (error) {
      console.error("加载世界观失败:", error);
      toast.error("加载世界观失败");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadWorldBuilding();
  }, [loadWorldBuilding]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const request: UpdateWorldBuildingRequest = {
        description: formData.description || undefined,
        era: formData.era || undefined,
        locations: formData.locations || undefined,
        rules: formData.rules || undefined,
      };
      const updated = await updateWorldBuilding(projectId, request);
      setWorldBuilding(updated);
      setHasChanges(false);
      toast.success("世界观已保存");
    } catch (error) {
      console.error("保存世界观失败:", error);
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
          <Globe className="h-4 w-4" />
          <span className="text-sm">世界观设定</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadWorldBuilding}
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
          <Label htmlFor="description">世界观描述</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="描述故事发生的世界背景..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            整体描述故事发生的世界，包括基本设定和核心概念
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="era">时代背景</Label>
          <Textarea
            id="era"
            value={formData.era}
            onChange={(e) => handleChange("era", e.target.value)}
            placeholder="故事发生的时代..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            描述故事发生的时代，如现代、古代、未来等
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locations">地点设定</Label>
          <Textarea
            id="locations"
            value={formData.locations}
            onChange={(e) => handleChange("locations", e.target.value)}
            placeholder="主要地点和场景..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            描述故事中的主要地点、城市、场景等
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rules">规则/设定</Label>
          <Textarea
            id="rules"
            value={formData.rules}
            onChange={(e) => handleChange("rules", e.target.value)}
            placeholder="世界运行的规则..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            描述世界运行的规则，如魔法体系、科技水平、社会制度等
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
