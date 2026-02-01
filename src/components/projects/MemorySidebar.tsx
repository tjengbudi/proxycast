/**
 * 记忆侧边栏
 *
 * 在编辑页面显示项目的角色、世界观、风格指南（只读）
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Users,
  Globe,
  Palette,
  ChevronDown,
  ChevronRight,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ProjectMemory,
  Character,
  WorldBuilding,
  StyleGuide,
  getProjectMemory,
} from "@/lib/api/memory";

interface MemorySidebarProps {
  projectId: string;
  className?: string;
}

export function MemorySidebar({ projectId, className }: MemorySidebarProps) {
  const [memory, setMemory] = useState<ProjectMemory | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["characters", "world", "style"]),
  );

  const loadMemory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjectMemory(projectId);
      setMemory(data);
    } catch (error) {
      console.error("加载记忆失败:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-40 border-l bg-muted/30",
          className,
        )}
      >
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("border-l bg-muted/30 flex flex-col", className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-3 border-b">
        <span className="text-sm font-medium">项目记忆</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={loadMemory}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* 内容 */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {/* 角色 */}
          <SidebarSection
            title="角色"
            icon={<Users className="h-4 w-4" />}
            count={memory?.characters.length || 0}
            expanded={expandedSections.has("characters")}
            onToggle={() => toggleSection("characters")}
          >
            {memory?.characters && memory.characters.length > 0 ? (
              <div className="space-y-2">
                {memory.characters.map((character) => (
                  <CharacterItem key={character.id} character={character} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">暂无角色</p>
            )}
          </SidebarSection>

          {/* 世界观 */}
          <SidebarSection
            title="世界观"
            icon={<Globe className="h-4 w-4" />}
            expanded={expandedSections.has("world")}
            onToggle={() => toggleSection("world")}
          >
            {memory?.world_building ? (
              <WorldBuildingItem worldBuilding={memory.world_building} />
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                暂无世界观设定
              </p>
            )}
          </SidebarSection>

          {/* 风格指南 */}
          <SidebarSection
            title="风格指南"
            icon={<Palette className="h-4 w-4" />}
            expanded={expandedSections.has("style")}
            onToggle={() => toggleSection("style")}
          >
            {memory?.style_guide ? (
              <StyleGuideItem styleGuide={memory.style_guide} />
            ) : (
              <p className="text-xs text-muted-foreground py-2">暂无风格指南</p>
            )}
          </SidebarSection>
        </div>
      </ScrollArea>
    </div>
  );
}

// 侧边栏分区组件
interface SidebarSectionProps {
  title: string;
  icon: React.ReactNode;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function SidebarSection({
  title,
  icon,
  count,
  expanded,
  onToggle,
  children,
}: SidebarSectionProps) {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded hover:bg-accent/50 text-sm">
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        {icon}
        <span className="flex-1 text-left">{title}</span>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground">{count}</span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-8 pr-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

// 角色项组件
interface CharacterItemProps {
  character: Character;
}

function CharacterItem({ character }: CharacterItemProps) {
  return (
    <div className="p-2 rounded bg-background border text-xs">
      <div className="flex items-center gap-2 mb-1">
        <User className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium">{character.name}</span>
        {character.is_main && (
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
        )}
      </div>
      {character.description && (
        <p className="text-muted-foreground line-clamp-2">
          {character.description}
        </p>
      )}
    </div>
  );
}

// 世界观项组件
interface WorldBuildingItemProps {
  worldBuilding: WorldBuilding;
}

function WorldBuildingItem({ worldBuilding }: WorldBuildingItemProps) {
  return (
    <div className="p-2 rounded bg-background border text-xs space-y-2">
      {worldBuilding.description && (
        <div>
          <span className="text-muted-foreground">描述：</span>
          <p className="line-clamp-3">{worldBuilding.description}</p>
        </div>
      )}
      {worldBuilding.era && (
        <div>
          <span className="text-muted-foreground">时代：</span>
          <span>{worldBuilding.era}</span>
        </div>
      )}
      {worldBuilding.locations && (
        <div>
          <span className="text-muted-foreground">地点：</span>
          <p className="line-clamp-2">{worldBuilding.locations}</p>
        </div>
      )}
    </div>
  );
}

// 风格指南项组件
interface StyleGuideItemProps {
  styleGuide: StyleGuide;
}

function StyleGuideItem({ styleGuide }: StyleGuideItemProps) {
  return (
    <div className="p-2 rounded bg-background border text-xs space-y-2">
      {styleGuide.style && (
        <div>
          <span className="text-muted-foreground">风格：</span>
          <p className="line-clamp-2">{styleGuide.style}</p>
        </div>
      )}
      {styleGuide.tone && (
        <div>
          <span className="text-muted-foreground">语气：</span>
          <span>{styleGuide.tone}</span>
        </div>
      )}
      {styleGuide.forbidden_words.length > 0 && (
        <div>
          <span className="text-muted-foreground">禁用词：</span>
          <span>{styleGuide.forbidden_words.slice(0, 5).join(", ")}</span>
          {styleGuide.forbidden_words.length > 5 && (
            <span className="text-muted-foreground">
              {" "}
              等 {styleGuide.forbidden_words.length} 个
            </span>
          )}
        </div>
      )}
      {styleGuide.preferred_words.length > 0 && (
        <div>
          <span className="text-muted-foreground">偏好词：</span>
          <span>{styleGuide.preferred_words.slice(0, 5).join(", ")}</span>
          {styleGuide.preferred_words.length > 5 && (
            <span className="text-muted-foreground">
              {" "}
              等 {styleGuide.preferred_words.length} 个
            </span>
          )}
        </div>
      )}
    </div>
  );
}
