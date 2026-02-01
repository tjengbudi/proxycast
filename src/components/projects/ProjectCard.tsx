/**
 * 项目卡片组件
 *
 * 显示单个项目的卡片视图
 */

import { Star, Archive, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Project,
  getProjectTypeIcon,
  formatWordCount,
  formatRelativeTime,
} from "@/lib/api/project";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  onFavorite?: () => void;
  onArchive?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({
  project,
  onClick,
  onFavorite,
  onArchive,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const icon = project.icon || getProjectTypeIcon(project.workspaceType);
  const stats = project.stats;

  return (
    <div
      className={cn(
        "group relative flex flex-col p-4 rounded-xl border bg-card hover:bg-accent/50 cursor-pointer transition-all",
        "hover:shadow-md hover:border-primary/20",
      )}
      onClick={onClick}
    >
      {/* 顶部操作区 */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.();
          }}
        >
          <Star
            className={cn(
              "h-4 w-4",
              project.isFavorite && "fill-yellow-400 text-yellow-400",
            )}
          />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="h-4 w-4 mr-2" />
              {project.isArchived ? "取消归档" : "归档"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 图标 */}
      <div className="text-4xl mb-3">{icon}</div>

      {/* 项目名称 */}
      <h3 className="font-medium text-base mb-1 line-clamp-1">
        {project.name}
      </h3>

      {/* 统计信息 */}
      {stats && (
        <div className="text-sm text-muted-foreground mb-2">
          {stats.content_count > 0 && (
            <span>
              {stats.completed_count}/{stats.content_count} 完成
            </span>
          )}
          {stats.total_words > 0 && (
            <span className="ml-2">{formatWordCount(stats.total_words)}字</span>
          )}
        </div>
      )}

      {/* 标签 */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 更新时间 */}
      <div className="text-xs text-muted-foreground mt-auto">
        更新于 {formatRelativeTime(project.updatedAt)}
      </div>

      {/* 收藏标记 */}
      {project.isFavorite && (
        <Star className="absolute top-3 left-3 h-4 w-4 fill-yellow-400 text-yellow-400" />
      )}
    </div>
  );
}
