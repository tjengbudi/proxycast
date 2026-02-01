/**
 * 新建项目卡片组件
 *
 * 显示创建新项目的入口卡片
 */

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewProjectCardProps {
  onClick?: () => void;
}

export function NewProjectCard({ onClick }: NewProjectCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed",
        "bg-card/50 hover:bg-accent/30 cursor-pointer transition-all",
        "hover:border-primary/40 min-h-[160px]",
      )}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Plus className="h-6 w-6 text-muted-foreground" />
      </div>
      <span className="text-sm text-muted-foreground">新建项目</span>
    </div>
  );
}
