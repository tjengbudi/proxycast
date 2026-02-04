/**
 * @file PosterDesigner.tsx
 * @description 海报设计器主组件 - 集成 Agent 对话和画布
 * @module components/content-creator/canvas/poster/PosterDesigner
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Undo2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Eye,
  EyeOff,
  Download,
  Save,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentChatPanel } from "../../agents/AgentChatPanel";
import { useCanvasAgentBridge } from "./hooks/useCanvasAgentBridge";
import { showPlatformSafeZone, hideSafeZone } from "./utils/safeZone";
import type { AgentSuggestion, LayoutScheme } from "../../agents/base/types";
import type { PlatformId } from "./platforms/types";
import { allPlatformSpecs, getRecommendedSize } from "./platforms";

/**
 * 海报设计器属性
 */
export interface PosterDesignerProps {
  /** 项目 ID */
  projectId?: string;
  /** 品牌人设 ID */
  brandPersonaId?: string;
  /** 初始画布 JSON */
  initialCanvasJson?: Record<string, unknown>;
  /** 保存回调 */
  onSave?: (canvasJson: Record<string, unknown>) => void;
  /** 导出回调 */
  onExport?: (dataUrl: string, format: string) => void;
  /** 类名 */
  className?: string;
}

/**
 * 海报设计器
 */
export function PosterDesigner({
  projectId,
  brandPersonaId,
  initialCanvasJson,
  onSave,
  onExport,
  className,
}: PosterDesignerProps) {
  // 画布引用
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  // UI 状态
  const [showChatPanel, setShowChatPanel] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [currentPlatform, setCurrentPlatform] =
    useState<PlatformId>("xiaohongshu");
  const [zoom, setZoom] = useState(1);

  // Agent 桥接
  const {
    applyLayout,
    applySuggestion,
    undoLastOperation,
    getCanvasSnapshot: _getCanvasSnapshot,
    operationHistory,
    isProcessing,
    lastError,
  } = useCanvasAgentBridge(canvas);

  // 初始化画布
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1080,
      height: 1440,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    setCanvas(fabricCanvas);

    // 加载初始内容
    if (initialCanvasJson) {
      fabricCanvas.loadFromJSON(initialCanvasJson, () => {
        fabricCanvas.renderAll();
      });
    }

    return () => {
      fabricCanvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 处理布局应用
  const handleLayoutApply = useCallback(
    async (layoutJson: Record<string, unknown>) => {
      if (!canvas) return;

      const layout: LayoutScheme = {
        id: "applied-layout",
        name: "应用的布局",
        description: "",
        fabricJson: layoutJson as LayoutScheme["fabricJson"],
        metadata: {
          imageRatio: 0,
          textRatio: 0,
          whiteSpace: 0,
          hierarchy: [],
        },
      };

      await applyLayout(layout);
    },
    [canvas, applyLayout],
  );

  // 处理建议应用
  const handleSuggestionApply = useCallback(
    async (suggestion: AgentSuggestion) => {
      await applySuggestion(suggestion);
    },
    [applySuggestion],
  );

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    if (!canvas) return;
    const newZoom = Math.min(zoom * 1.2, 3);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  }, [canvas, zoom]);

  const handleZoomOut = useCallback(() => {
    if (!canvas) return;
    const newZoom = Math.max(zoom / 1.2, 0.3);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  }, [canvas, zoom]);

  const handleZoomReset = useCallback(() => {
    if (!canvas) return;
    canvas.setZoom(1);
    setZoom(1);
  }, [canvas]);

  // 安全区域切换
  const handleToggleSafeZone = useCallback(() => {
    if (!canvas) return;

    if (showSafeZone) {
      hideSafeZone(canvas);
    } else {
      showPlatformSafeZone(canvas, currentPlatform);
    }
    setShowSafeZone(!showSafeZone);
  }, [canvas, showSafeZone, currentPlatform]);

  // 平台切换
  const handlePlatformChange = useCallback(
    (platformId: PlatformId) => {
      setCurrentPlatform(platformId);

      if (!canvas) return;

      // 获取推荐尺寸
      const recommendedSize = getRecommendedSize(platformId);
      if (recommendedSize) {
        canvas.setWidth(recommendedSize.width);
        canvas.setHeight(recommendedSize.height);
        canvas.renderAll();
      }

      // 更新安全区域
      if (showSafeZone) {
        hideSafeZone(canvas);
        showPlatformSafeZone(canvas, platformId);
      }
    },
    [canvas, showSafeZone],
  );

  // 保存
  const handleSave = useCallback(() => {
    if (!canvas || !onSave) return;
    const json = canvas.toJSON() as Record<string, unknown>;
    onSave(json);
  }, [canvas, onSave]);

  // 导出
  const handleExport = useCallback(
    (format: "png" | "jpg" | "svg") => {
      if (!canvas || !onExport) return;

      let dataUrl: string;
      if (format === "svg") {
        dataUrl = canvas.toSVG();
      } else {
        dataUrl = canvas.toDataURL({
          format: format,
          quality: 1,
          multiplier: 2,
        });
      }
      onExport(dataUrl, format);
    },
    [canvas, onExport],
  );

  // 获取当前画布 JSON
  const getCanvasJson = useCallback((): Record<string, unknown> | null => {
    if (!canvas) return null;
    return canvas.toJSON() as Record<string, unknown>;
  }, [canvas]);

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-2">
          {/* 撤销/重做 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={undoLastOperation}
                  disabled={operationHistory.length === 0}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>撤销</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-6 bg-border" />

          {/* 缩放控制 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>缩小</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomReset}
            className="min-w-[60px]"
          >
            {Math.round(zoom * 100)}%
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>放大</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-6 bg-border" />

          {/* 平台选择 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Grid3X3 className="h-4 w-4 mr-2" />
                {allPlatformSpecs.find((p) => p.id === currentPlatform)?.name ||
                  "选择平台"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {allPlatformSpecs.map((platform) => (
                <DropdownMenuItem
                  key={platform.id}
                  onClick={() => handlePlatformChange(platform.id)}
                >
                  {platform.name}
                  {platform.id === currentPlatform && (
                    <Badge variant="secondary" className="ml-2">
                      当前
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 安全区域 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showSafeZone ? "secondary" : "ghost"}
                  size="icon"
                  onClick={handleToggleSafeZone}
                >
                  {showSafeZone ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showSafeZone ? "隐藏安全区域" : "显示安全区域"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          {/* 状态指示 */}
          {isProcessing && <Badge variant="secondary">处理中...</Badge>}
          {lastError && <Badge variant="destructive">{lastError}</Badge>}

          {/* 对话面板切换 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showChatPanel ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setShowChatPanel(!showChatPanel)}
                >
                  {showChatPanel ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelLeft className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showChatPanel ? "隐藏 AI 助手" : "显示 AI 助手"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-6 bg-border" />

          {/* 保存 */}
          {onSave && (
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          )}

          {/* 导出 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("png")}>
                导出 PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("jpg")}>
                导出 JPG
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("svg")}>
                导出 SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden flex">
        {/* AI 对话面板 */}
        {showChatPanel && (
          <div className="w-[350px] border-r flex-shrink-0">
            <AgentChatPanel
              projectId={projectId}
              brandPersonaId={brandPersonaId}
              canvasJson={getCanvasJson() || undefined}
              onSuggestionApply={handleSuggestionApply}
              onLayoutApply={handleLayoutApply}
              className="h-full"
            />
          </div>
        )}

        {/* 画布区域 */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 overflow-auto p-8">
          <div
            className="shadow-lg"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosterDesigner;
