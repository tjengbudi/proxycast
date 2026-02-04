/**
 * @file Slider 表单组件
 * @description 滑块
 */

import type { SliderComponent, A2UIFormData } from "../../types";
import { resolveDynamicValue } from "../../parser";

interface SliderRendererProps {
  component: SliderComponent;
  data: Record<string, unknown>;
  formData: A2UIFormData;
  onFormChange: (id: string, value: unknown) => void;
}

export function SliderRenderer({
  component,
  data,
  formData,
  onFormChange,
}: SliderRendererProps) {
  const label = component.label
    ? String(resolveDynamicValue(component.label, data, ""))
    : "";
  const value =
    (formData[component.id] as number) ??
    (resolveDynamicValue(component.value, data, component.min) as number);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <label className="text-sm font-medium">{label}</label>}
        {component.showValue !== false && (
          <span className="text-sm text-muted-foreground">{value}</span>
        )}
      </div>
      <input
        type="range"
        min={component.min}
        max={component.max}
        step={component.step || 1}
        value={value}
        onChange={(e) => onFormChange(component.id, Number(e.target.value))}
        className="w-full"
      />
      {component.marks && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {component.marks.map((mark) => (
            <span key={mark.value}>{mark.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
