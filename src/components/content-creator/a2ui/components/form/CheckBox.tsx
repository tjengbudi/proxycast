/**
 * @file CheckBox 表单组件
 * @description 复选框
 */

import type { CheckBoxComponent, A2UIFormData } from "../../types";
import { resolveDynamicValue } from "../../parser";

interface CheckBoxRendererProps {
  component: CheckBoxComponent;
  data: Record<string, unknown>;
  formData: A2UIFormData;
  onFormChange: (id: string, value: unknown) => void;
}

export function CheckBoxRenderer({
  component,
  data,
  formData,
  onFormChange,
}: CheckBoxRendererProps) {
  const label = String(resolveDynamicValue(component.label, data, ""));
  const checked =
    (formData[component.id] as boolean) ??
    Boolean(resolveDynamicValue(component.value, data, false));

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onFormChange(component.id, e.target.checked)}
        className="w-4 h-4 rounded border-gray-300"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
