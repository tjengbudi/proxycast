/**
 * @file useMultiPlatformExport.ts
 * @description 多平台导出 Hook
 * @module hooks/useMultiPlatformExport
 */

import { useState, useCallback } from "react";
import { fabric } from "fabric";
import {
  allPlatformSpecs,
  getPlatformSpec,
  checkFileCompliance,
  type PlatformId,
  type SizeSpec,
  type ExportConfig,
  type BatchExportConfig,
  type ExportResult,
} from "@/components/content-creator/canvas/poster/platforms";
import {
  calculateSmartCrop,
  previewCrop,
} from "@/components/content-creator/canvas/poster/utils/smartCrop";

/**
 * 导出进度
 */
export interface ExportProgress {
  /** 当前索引 */
  current: number;
  /** 总数 */
  total: number;
  /** 当前平台 */
  currentPlatform?: string;
  /** 当前尺寸 */
  currentSize?: string;
}

/**
 * Hook 返回值
 */
export interface UseMultiPlatformExportReturn {
  /** 所有平台规范 */
  platforms: typeof allPlatformSpecs;
  /** 导出单个尺寸 */
  exportSingle: (
    canvas: fabric.Canvas,
    config: ExportConfig,
  ) => Promise<ExportResult>;
  /** 批量导出 */
  exportBatch: (
    canvas: fabric.Canvas,
    config: BatchExportConfig,
  ) => Promise<ExportResult[]>;
  /** 预览导出效果 */
  previewExport: (
    canvas: fabric.Canvas,
    platformId: PlatformId,
    sizeSpec: SizeSpec,
  ) => Promise<string | null>;
  /** 检查文件合规性 */
  checkCompliance: typeof checkFileCompliance;
  /** 获取平台规范 */
  getPlatform: typeof getPlatformSpec;
  /** 导出进度 */
  progress: ExportProgress | null;
  /** 是否正在导出 */
  isExporting: boolean;
  /** 导出结果 */
  results: ExportResult[];
  /** 错误信息 */
  error: string | null;
}

/**
 * 多平台导出 Hook
 */
export function useMultiPlatformExport(): UseMultiPlatformExportReturn {
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [results, setResults] = useState<ExportResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * 导出单个尺寸
   */
  const exportSingle = useCallback(
    async (
      canvas: fabric.Canvas,
      config: ExportConfig,
    ): Promise<ExportResult> => {
      const { platform, sizeSpec, format, quality } = config;

      try {
        // 获取原始画布尺寸
        const sourceWidth = canvas.getWidth();
        const sourceHeight = canvas.getHeight();

        // 计算裁切区域
        const cropResult = calculateSmartCrop({
          sourceWidth,
          sourceHeight,
          targetSpec: sizeSpec,
          strategy: "smart",
        });

        // 创建临时画布
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = sizeSpec.width;
        tempCanvas.height = sizeSpec.height;
        const ctx = tempCanvas.getContext("2d");

        if (!ctx) {
          throw new Error("无法创建 canvas context");
        }

        // 获取原始画布图像
        const sourceDataUrl = canvas.toDataURL({
          format: "png",
          multiplier: 2,
        });

        // 加载并裁切
        const img = await loadImage(sourceDataUrl);
        const { cropRegion } = cropResult;

        ctx.drawImage(
          img,
          cropRegion.x,
          cropRegion.y,
          cropRegion.width,
          cropRegion.height,
          0,
          0,
          sizeSpec.width,
          sizeSpec.height,
        );

        // 导出
        const dataUrl = tempCanvas.toDataURL(`image/${format}`, quality / 100);

        // 计算文件大小
        const base64Length = dataUrl.split(",")[1]?.length || 0;
        const fileSize = Math.round((base64Length * 3) / 4);

        // 检查合规性
        const compliance = checkFileCompliance(
          platform,
          fileSize / 1024,
          format,
        );

        if (!compliance.valid) {
          return {
            success: false,
            platform,
            sizeName: sizeSpec.name,
            error: compliance.errors.join("; "),
          };
        }

        return {
          success: true,
          platform,
          sizeName: sizeSpec.name,
          filePath: dataUrl,
          fileSize,
        };
      } catch (err) {
        return {
          success: false,
          platform,
          sizeName: sizeSpec.name,
          error: err instanceof Error ? err.message : "导出失败",
        };
      }
    },
    [],
  );

  /**
   * 批量导出
   */
  const exportBatch = useCallback(
    async (
      canvas: fabric.Canvas,
      config: BatchExportConfig,
    ): Promise<ExportResult[]> => {
      setIsExporting(true);
      setError(null);
      setResults([]);

      const { configs } = config;
      const exportResults: ExportResult[] = [];

      setProgress({
        current: 0,
        total: configs.length,
      });

      for (let i = 0; i < configs.length; i++) {
        const exportConfig = configs[i];
        const platformSpec = getPlatformSpec(exportConfig.platform);

        setProgress({
          current: i + 1,
          total: configs.length,
          currentPlatform: platformSpec?.name,
          currentSize: exportConfig.sizeSpec.name,
        });

        const result = await exportSingle(canvas, exportConfig);
        exportResults.push(result);
      }

      setResults(exportResults);
      setProgress(null);
      setIsExporting(false);

      return exportResults;
    },
    [exportSingle],
  );

  /**
   * 预览导出效果
   */
  const previewExportFn = useCallback(
    async (
      canvas: fabric.Canvas,
      platformId: PlatformId,
      sizeSpec: SizeSpec,
    ): Promise<string | null> => {
      try {
        const sourceWidth = canvas.getWidth();
        const sourceHeight = canvas.getHeight();

        const cropResult = calculateSmartCrop({
          sourceWidth,
          sourceHeight,
          targetSpec: sizeSpec,
          strategy: "smart",
        });

        const sourceDataUrl = canvas.toDataURL({
          format: "png",
          multiplier: 1,
        });

        return await previewCrop(sourceDataUrl, cropResult, sizeSpec);
      } catch (err) {
        setError(err instanceof Error ? err.message : "预览失败");
        return null;
      }
    },
    [],
  );

  return {
    platforms: allPlatformSpecs,
    exportSingle,
    exportBatch,
    previewExport: previewExportFn,
    checkCompliance: checkFileCompliance,
    getPlatform: getPlatformSpec,
    progress,
    isExporting,
    results,
    error,
  };
}

/**
 * 加载图片
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = src;
  });
}

export default useMultiPlatformExport;
