/**
 * @file Text 展示组件
 * @description 文本显示
 */

import type { TextComponent } from "../../types";
import { resolveDynamicValue } from "../../parser";

interface TextRendererProps {
  component: TextComponent;
  data: Record<string, unknown>;
}

const variantClass: Record<string, string> = {
  h1: "text-2xl font-bold",
  h2: "text-xl font-semibold",
  h3: "text-lg font-semibold",
  h4: "text-base font-medium",
  h5: "text-sm font-medium",
  body: "text-sm",
  caption: "text-xs text-muted-foreground",
};

export function TextRenderer({ component, data }: TextRendererProps) {
  const text = resolveDynamicValue(component.text, data, "");

  return (
    <div className={variantClass[component.variant || "body"]}>
      {String(text)}
    </div>
  );
}
