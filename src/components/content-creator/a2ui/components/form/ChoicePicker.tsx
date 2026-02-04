/**
 * @file ChoicePicker 表单组件
 * @description 选择器
 */

import type { ChoicePickerComponent, A2UIFormData } from "../../types";
import { resolveDynamicValue } from "../../parser";
import { cn } from "@/lib/utils";

interface ChoicePickerRendererProps {
  component: ChoicePickerComponent;
  data: Record<string, unknown>;
  formData: A2UIFormData;
  onFormChange: (id: string, value: unknown) => void;
}

export function ChoicePickerRenderer({
  component,
  data,
  formData,
  onFormChange,
}: ChoicePickerRendererProps) {
  const label = component.label
    ? String(resolveDynamicValue(component.label, data, ""))
    : "";
  const selectedValues =
    (formData[component.id] as string[]) ??
    (resolveDynamicValue(component.value, data, []) as string[]);
  const isMultiple = component.variant === "multipleSelection";
  const isWrap =
    component.layout === "wrap" || component.layout === "horizontal";

  const handleSelect = (optionValue: string) => {
    if (isMultiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onFormChange(component.id, newValues);
    } else {
      onFormChange(component.id, [optionValue]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium">{label}</div>}
      <div className={cn("flex gap-2", isWrap ? "flex-wrap" : "flex-col")}>
        {component.options.map((option) => {
          const optionLabel = String(
            resolveDynamicValue(option.label, data, ""),
          );
          const isSelected = selectedValues.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "px-3 py-2 text-sm rounded-lg border transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 hover:bg-accent",
              )}
            >
              <div className="flex items-center gap-2">
                {option.icon && <span>{option.icon}</span>}
                <span>{optionLabel}</span>
              </div>
              {option.description && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
