/**
 * @file Divider 布局组件
 * @description 分隔线
 */

import type { DividerComponent } from "../../types";
import { cn } from "@/lib/utils";

interface DividerRendererProps {
  component: DividerComponent;
}

export function DividerRenderer({ component }: DividerRendererProps) {
  const isVertical = component.axis === "vertical";
  return (
    <div
      className={cn(
        "bg-border",
        isVertical ? "w-px h-full min-h-[20px]" : "h-px w-full",
      )}
    />
  );
}
