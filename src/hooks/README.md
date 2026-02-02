# Hooks 目录

全局共享的 React Hooks。

## 文件索引

| 文件 | 说明 |
|------|------|
| `useUnifiedChat.ts` | 统一对话 Hook，支持 Agent/General/Creator 三种模式 |

## useUnifiedChat

统一的对话逻辑 Hook，替代原有分散的 `useAgentChat` 和 `useChat`。

### 使用示例

```typescript
import { useUnifiedChat } from "@/hooks/useUnifiedChat";

// Agent 模式
const agentChat = useUnifiedChat({
  mode: "agent",
  providerType: "claude",
  model: "claude-sonnet-4-20250514",
});

// 内容创作模式
const creatorChat = useUnifiedChat({
  mode: "creator",
  systemPrompt: "你是一位专业的内容创作助手...",
  onCanvasUpdate: (path, content) => {
    // 更新画布内容
  },
});

// 通用对话模式
const generalChat = useUnifiedChat({
  mode: "general",
});
```

### 返回值

- `session` - 当前会话
- `messages` - 消息列表
- `isLoading` - 加载状态
- `isSending` - 发送状态
- `error` - 错误信息
- `createSession()` - 创建会话
- `loadSession()` - 加载会话
- `sendMessage()` - 发送消息
- `stopGeneration()` - 停止生成
- `configureProvider()` - 配置 Provider

## 相关文档

- 架构设计：`docs/prd/chat-architecture-redesign.md`
- 类型定义：`src/types/chat.ts`
- API 封装：`src/lib/api/unified-chat.ts`
