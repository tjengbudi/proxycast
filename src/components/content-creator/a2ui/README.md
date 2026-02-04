# A2UI - Agent-to-User Interface

结构化 UI 响应系统，基于 Google A2UI v0.10 规范实现。

## 功能概述

A2UI 允许 AI 返回结构化的表单组件，用户通过点击选项来回答，而不是打字输入。

## 文件索引

| 文件 | 说明 |
|------|------|
| `index.ts` | 模块导出入口 |
| `types.ts` | A2UI 组件类型定义（基于 v0.10 规范） |
| `parser.ts` | A2UI JSON 解析器，支持简化表单格式 |
| `components/` | React 组件渲染器 |

## 规范版本

当前实现基于 [A2UI v0.10 规范](https://a2ui.org/specification/v0_10/)。

## 支持的格式

### 1. 简化表单格式（推荐）

AI 返回简单的 JSON 格式，系统自动转换为完整 A2UI：

```json
{
  "type": "form",
  "title": "收集偏好",
  "description": "请选择你的偏好设置",
  "fields": [
    {
      "id": "audience",
      "type": "choice",
      "label": "目标受众",
      "options": [
        {"value": "business", "label": "商务人士"},
        {"value": "consumer", "label": "普通消费者"}
      ],
      "default": "business"
    }
  ],
  "submitLabel": "确认"
}
```

### 2. 完整 A2UI 格式

符合 A2UI 规范的完整组件树结构。

## 支持的组件

### 布局组件
- Row, Column, List, Card, Tabs, Modal, Divider

### 展示组件
- Text, Icon, Image, Video, AudioPlayer

### 交互组件
- Button, TextField, CheckBox, ChoicePicker, Slider, DateTimeInput

## 核心概念

### 动态值
支持字面量、数据绑定和函数调用：
- 字面量: `"Hello"`
- 数据绑定: `{ "path": "/user/name" }`
- 函数调用: `{ "call": "formatDate", "args": { "value": { "path": "/date" } } }`

### 验证规则 (checks)
```json
{
  "checks": [
    {
      "condition": { "call": "required", "args": { "value": { "path": "/email" } } },
      "message": "邮箱不能为空"
    }
  ]
}
```

## 使用方式

AI 响应中使用 `\`\`\`a2ui` 代码块包裹 JSON：

```markdown
\`\`\`a2ui
{
  "type": "form",
  ...
}
\`\`\`
```

## 相关项目

- `aster-a2ui`: Rust 实现的 A2UI 协议库（位于 aster-rust 框架）

## 依赖关系

- 被 `StreamingRenderer` 组件使用
- 被 `AgentChatPage` 处理表单提交
