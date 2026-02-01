/**
 * 创建项目对话框
 *
 * 用于创建新项目
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ProjectType,
  USER_PROJECT_TYPES,
  getProjectTypeLabel,
  getProjectTypeIcon,
} from "@/lib/api/project";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, type: ProjectType) => Promise<void>;
  defaultType?: ProjectType;
  defaultName?: string;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultType,
  defaultName,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>(defaultType || "general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当对话框打开且 defaultType 变化时，更新类型选择
  useEffect(() => {
    if (open && defaultType) {
      setType(defaultType);
    }
  }, [open, defaultType]);

  // 当对话框打开且 defaultName 变化时，更新项目名称
  useEffect(() => {
    if (open && defaultName) {
      setName(defaultName);
    }
  }, [open, defaultName]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), type);
      setName("");
      setType(defaultType || "general");
      onOpenChange(false);
    } catch (error) {
      // 如果是用户取消选择目录，不显示错误
      if (error instanceof Error && error.message === "用户取消选择目录") {
        // 用户取消，不做任何处理
      } else {
        console.error("创建项目失败:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>新建项目</DialogTitle>
          <DialogDescription>
            创建一个新的内容创作项目，选择项目类型以获得最佳体验。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* 项目名称 */}
          <div className="grid gap-2">
            <Label htmlFor="name">项目名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入项目名称..."
              autoFocus
            />
          </div>

          {/* 项目类型 */}
          <div className="grid gap-3">
            <Label>项目类型</Label>
            <div className="grid grid-cols-3 gap-3">
              {USER_PROJECT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                    "hover:border-primary/50 hover:bg-accent/50",
                    type === t
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border",
                  )}
                  onClick={() => setType(t)}
                >
                  <span className="text-2xl">{getProjectTypeIcon(t)}</span>
                  <span className="text-xs font-medium">
                    {getProjectTypeLabel(t)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? "创建中..." : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
