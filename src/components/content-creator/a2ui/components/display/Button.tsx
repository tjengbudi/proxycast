/**
 * @file Button 展示组件
 * @description 按钮
 */

import type {
  ButtonComponent,
  TextComponent,
  A2UIComponent,
  A2UIEvent,
} from "../../types";
import { getComponentById, resolveDynamicValue } from "../../parser";
import { cn } from "@/lib/utils";

interface ButtonRendererProps {
  component: ButtonComponent;
  components: A2UIComponent[];
  data: Record<string, unknown>;
  onAction: (event: A2UIEvent) => void;
}

const variantClass: Record<string, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  borderless: "hover:bg-accent hover:text-accent-foreground",
};

export function ButtonRenderer({
  component,
  components,
  data,
  onAction,
}: ButtonRendererProps) {
  const child = getComponentById(components, component.child);
  const label =
    child && child.component === "Text"
      ? resolveDynamicValue((child as TextComponent).text, data, "")
      : "";

  const handleClick = () => {
    // 兼容新旧 action 格式
    let actionName = "";
    let actionContext: Record<string, unknown> | undefined;

    if ("event" in component.action) {
      // EventAction 格式
      actionName = component.action.event.name;
      actionContext = component.action.event.context as Record<string, unknown>;
    } else if ("functionCall" in component.action) {
      // FunctionAction 格式
      actionName = component.action.functionCall.call;
      actionContext = component.action.functionCall.args as Record<
        string,
        unknown
      >;
    } else if ("name" in component.action) {
      // 旧的 ButtonAction 格式
      actionName = component.action.name;
      actionContext = component.action.context as Record<string, unknown>;
    }

    onAction({
      type: "action",
      componentId: component.id,
      action: {
        name: actionName,
        context: actionContext,
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "px-4 py-2 rounded-md transition-colors",
        variantClass[component.variant || "primary"],
      )}
    >
      {String(label)}
    </button>
  );
}
