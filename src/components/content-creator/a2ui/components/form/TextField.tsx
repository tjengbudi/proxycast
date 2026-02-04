/**
 * @file TextField 表单组件
 * @description 文本输入框
 */

import type { TextFieldComponent, A2UIFormData } from "../../types";
import { resolveDynamicValue } from "../../parser";

interface TextFieldRendererProps {
  component: TextFieldComponent;
  data: Record<string, unknown>;
  formData: A2UIFormData;
  onFormChange: (id: string, value: unknown) => void;
}

export function TextFieldRenderer({
  component,
  data,
  formData,
  onFormChange,
}: TextFieldRendererProps) {
  const label = String(resolveDynamicValue(component.label, data, ""));
  const value =
    (formData[component.id] as string) ??
    String(resolveDynamicValue(component.value, data, ""));
  const isLongText = component.variant === "longText";

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      {isLongText ? (
        <textarea
          value={value}
          onChange={(e) => onFormChange(component.id, e.target.value)}
          placeholder={component.placeholder}
          className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background resize-y"
        />
      ) : (
        <input
          type={
            component.variant === "number"
              ? "number"
              : component.variant === "obscured"
                ? "password"
                : "text"
          }
          value={value}
          onChange={(e) => onFormChange(component.id, e.target.value)}
          placeholder={component.placeholder}
          className="w-full px-3 py-2 text-sm border rounded-md bg-background"
        />
      )}
      {component.helperText && (
        <p className="text-xs text-muted-foreground">{component.helperText}</p>
      )}
    </div>
  );
}
