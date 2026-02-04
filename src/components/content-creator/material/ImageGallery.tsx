/**
 * @file ImageGallery.tsx
 * @description 图片素材库组件，用于海报设计中的图片素材管理和选择
 * @module components/content-creator/material/ImageGallery
 */

import { useState, useMemo } from "react";
import { usePosterMaterial } from "@/hooks/usePosterMaterial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SearchIcon,
  ImageIcon,
  CheckIcon,
  XIcon,
  GridIcon,
  ListIcon,
} from "lucide-react";
import type { PosterMaterial, ImageCategory } from "@/types/poster-material";
import {
  IMAGE_CATEGORY_NAMES,
  IMAGE_CATEGORY_ICONS,
} from "@/types/poster-material";
import { cn } from "@/lib/utils";

export interface ImageGalleryProps {
  /** 项目 ID */
  projectId: string;
  /** 选中的素材 ID 列表 */
  selectedIds?: string[];
  /** 是否允许多选 */
  multiple?: boolean;
  /** 选择变化回调 */
  onSelect?: (materials: PosterMaterial[]) => void;
  /** 双击素材回调（用于直接应用到画布） */
  onDoubleClick?: (material: PosterMaterial) => void;
  /** 自定义类名 */
  className?: string;
  /** 最大高度 */
  maxHeight?: string | number;
}

const ALL_CATEGORIES: ImageCategory[] = [
  "background",
  "product",
  "person",
  "decoration",
  "texture",
  "other",
];

/**
 * 图片素材库组件
 *
 * 提供图片素材的浏览、筛选和选择功能。
 */
export function ImageGallery({
  projectId,
  selectedIds = [],
  multiple = false,
  onSelect,
  onDoubleClick,
  className,
  maxHeight = "400px",
}: ImageGalleryProps) {
  const { materials, loading, filter, setFilter } = usePosterMaterial(
    projectId,
    { type: "image" },
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] =
    useState<ImageCategory | null>(null);

  // 本地筛选
  const filteredMaterials = useMemo(() => {
    let result = materials;

    // 按分类筛选
    if (selectedCategory) {
      result = result.filter(
        (m) => m.metadata?.imageCategory === selectedCategory,
      );
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    return result;
  }, [materials, selectedCategory, searchQuery]);

  const handleCategoryFilter = (category: ImageCategory | null) => {
    setSelectedCategory(category);
    setFilter({ ...filter, imageCategory: category || undefined });
  };

  const handleSelect = (material: PosterMaterial) => {
    if (!onSelect) return;

    if (multiple) {
      const isSelected = selectedIds.includes(material.id);
      if (isSelected) {
        onSelect(
          materials.filter(
            (m) => selectedIds.includes(m.id) && m.id !== material.id,
          ),
        );
      } else {
        onSelect([
          ...materials.filter((m) => selectedIds.includes(m.id)),
          material,
        ]);
      }
    } else {
      onSelect([material]);
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* 工具栏 */}
      <div className="flex items-center gap-2">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索图片..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchQuery("")}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* 视图切换 */}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={() => setViewMode("grid")}
          >
            <GridIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-1">
        <Button
          variant={!selectedCategory ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => handleCategoryFilter(null)}
        >
          全部
        </Button>
        {ALL_CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleCategoryFilter(category)}
          >
            <span className="mr-1">{IMAGE_CATEGORY_ICONS[category]}</span>
            {IMAGE_CATEGORY_NAMES[category]}
          </Button>
        ))}
      </div>

      {/* 素材列表 */}
      <ScrollArea style={{ maxHeight }} className="rounded-md border">
        {filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ImageIcon className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm">暂无图片素材</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-2 p-2">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                  isSelected(material.id)
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/30",
                )}
                onClick={() => handleSelect(material)}
                onDoubleClick={() => onDoubleClick?.(material)}
              >
                {/* 缩略图或占位符 */}
                {material.metadata?.thumbnail ? (
                  <img
                    src={material.metadata.thumbnail}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                ) : material.filePath ? (
                  <img
                    src={`asset://localhost/${material.filePath}`}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}

                {/* 选中标记 */}
                {isSelected(material.id) && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                    <CheckIcon className="h-3 w-3" />
                  </div>
                )}

                {/* 分类标签 */}
                {material.metadata?.imageCategory && (
                  <div className="absolute bottom-1 left-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1 py-0 bg-background/80"
                    >
                      {
                        IMAGE_CATEGORY_ICONS[
                          material.metadata.imageCategory as ImageCategory
                        ]
                      }
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className={cn(
                  "flex items-center gap-3 p-2 cursor-pointer transition-colors",
                  isSelected(material.id)
                    ? "bg-primary/10"
                    : "hover:bg-muted/50",
                )}
                onClick={() => handleSelect(material)}
                onDoubleClick={() => onDoubleClick?.(material)}
              >
                {/* 缩略图 */}
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  {material.metadata?.thumbnail ? (
                    <img
                      src={material.metadata.thumbnail}
                      alt={material.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {material.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {material.metadata?.imageCategory && (
                      <span>
                        {
                          IMAGE_CATEGORY_NAMES[
                            material.metadata.imageCategory as ImageCategory
                          ]
                        }
                      </span>
                    )}
                    {material.metadata?.width && material.metadata?.height && (
                      <span>
                        {material.metadata.width}×{material.metadata.height}
                      </span>
                    )}
                  </div>
                </div>

                {/* 选中标记 */}
                {isSelected(material.id) && (
                  <CheckIcon className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* 统计信息 */}
      <div className="text-xs text-muted-foreground">
        共 {filteredMaterials.length} 张图片
        {selectedIds.length > 0 && `，已选 ${selectedIds.length} 张`}
      </div>
    </div>
  );
}

export default ImageGallery;
