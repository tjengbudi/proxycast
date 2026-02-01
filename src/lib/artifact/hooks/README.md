# Artifact Hooks

Artifact 系统的 React Hooks 封装。

## 文件索引

| 文件 | 说明 |
|------|------|
| `index.ts` | 模块导出入口 |
| `useArtifact.ts` | Artifact 状态读取和操作 Hook |
| `useArtifactParser.ts` | Artifact 解析器 Hook，用于流式解析 AI 响应 |
| `useDebouncedValue.ts` | 防抖值 Hook，用于避免频繁重渲染 |

## useArtifact

封装 Artifact 状态的读取和操作：

```typescript
import { useArtifact } from '@/lib/artifact/hooks/useArtifact';

function MyComponent() {
  const {
    artifacts,           // Artifact 列表
    selectedArtifact,    // 当前选中的 Artifact
    addArtifact,         // 添加 Artifact
    updateArtifact,      // 更新 Artifact
    removeArtifact,      // 删除 Artifact
    selectArtifact,      // 选中 Artifact
    clearArtifacts,      // 清空所有 Artifact
  } = useArtifact();

  // ...
}
```

## useArtifactParser

封装 ArtifactParser 实例管理，用于流式解析 AI 响应：

```typescript
import { useArtifactParser } from '@/lib/artifact/hooks/useArtifactParser';

function StreamingChat() {
  const {
    startParsing,      // 开始新的解析会话
    appendChunk,       // 追加文本块进行流式解析
    finalizeParsing,   // 完成解析会话
    isActive,          // 检查解析器是否活动
    reset,             // 重置解析器状态
  } = useArtifactParser();

  const handleStreamStart = () => {
    startParsing();
  };

  const handleStreamChunk = (chunk: string) => {
    const result = appendChunk(chunk);
    // result.artifacts 包含当前解析出的所有 artifact
  };

  const handleStreamEnd = () => {
    const result = finalizeParsing();
    // result.artifacts 包含最终的所有 artifact
  };

  // ...
}
```

### 配置选项

```typescript
const { startParsing, appendChunk, finalizeParsing } = useArtifactParser({
  autoDetectLanguage: true,        // 是否自动检测语言
  treatCodeBlockAsArtifact: true,  // 是否将普通代码块识别为 artifact
});
```

## useDebouncedValue

防抖值 Hook，用于避免频繁重渲染（Requirement 11.2）：

```typescript
import { useDebouncedValue, useDebouncedCallback } from '@/lib/artifact/hooks';

// 防抖值
function StreamingContent({ content }: { content: string }) {
  // 内容更新会被防抖处理，避免频繁重渲染
  const debouncedContent = useDebouncedValue(content, 100);
  return <pre>{debouncedContent}</pre>;
}

// 防抖回调
function Editor({ onContentChange }: { onContentChange: (content: string) => void }) {
  const debouncedOnChange = useDebouncedCallback(onContentChange, 200);
  return <textarea onChange={(e) => debouncedOnChange(e.target.value)} />;
}
```

## 依赖关系

- `../store.ts` - Jotai atoms 定义
- `../types.ts` - 类型定义
- `../parser.ts` - ArtifactParser 解析器类
