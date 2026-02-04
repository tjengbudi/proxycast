# A2UI 组件

A2UI (Agent-to-User Interface) 组件渲染器，基于 Google A2UI v0.10 规范。

## 目录结构

```
components/
├── index.tsx           # 主渲染器 A2UIRenderer
├── ComponentRenderer.tsx # 组件分发器
├── layout/             # 布局组件
│   ├── Row.tsx         # 水平布局
│   ├── Column.tsx      # 垂直布局
│   ├── Card.tsx        # 卡片容器
│   └── Divider.tsx     # 分隔线
├── display/            # 展示组件
│   ├── Text.tsx        # 文本
│   └── Button.tsx      # 按钮
└── form/               # 表单组件
    ├── TextField.tsx   # 文本输入
    ├── CheckBox.tsx    # 复选框
    ├── ChoicePicker.tsx # 选择器
    └── Slider.tsx      # 滑块
```

## 使用方式

```tsx
import { A2UIRenderer } from "./components";

<A2UIRenderer
  response={a2uiResponse}
  onEvent={handleEvent}
  onSubmit={handleSubmit}
  formId="unique-form-id"
  initialFormData={savedFormData}
  onFormChange={handleFormChange}
/>
```

## 组件类型

| 类型 | 组件 | 说明 |
|------|------|------|
| 布局 | Row, Column, Card, Divider | 容器和分隔 |
| 展示 | Text, Button | 文本和交互 |
| 表单 | TextField, CheckBox, ChoicePicker, Slider | 数据输入 |

## 扩展组件

如需添加新组件：
1. 在对应目录创建组件文件
2. 在 `ComponentRenderer.tsx` 添加 case
3. 在 `index.tsx` 导出
