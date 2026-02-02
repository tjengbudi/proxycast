# WriteFile 解析器模块

## 概述

本模块提供 `<write_file>` 标签的流式解析功能，用于从 AI 响应中提取文件内容并实时显示在画布中。

## 文件索引

| 文件 | 说明 |
|------|------|
| `parser.ts` | WriteFile 标签解析器实现 |
| `index.ts` | 模块导出 |

## 核心功能

### WriteFileParser

流式解析 `<write_file path="xxx.md">...</write_file>` 标签。

```typescript
import { WriteFileParser } from "@/lib/writeFile";

// 静态方法：一次性解析
const result = WriteFileParser.parse(text);

// 实例方法：流式解析
const parser = new WriteFileParser();
const result1 = parser.parse(partialText);
const result2 = parser.parse(moreText);
```

### 解析结果

```typescript
interface WriteFileParseResult {
  blocks: WriteFileBlock[];  // 解析出的文件块
  plainText: string;         // 去除标签后的纯文本
  hasStreamingBlock: boolean; // 是否有正在解析的块
}

interface WriteFileBlock {
  path: string;      // 文件路径
  content: string;   // 文件内容
  isComplete: boolean; // 是否解析完成
  startIndex: number;  // 起始位置
  endIndex: number;    // 结束位置
}
```

## 使用场景

1. **流式画布更新**：AI 输出 `<write_file>` 标签时，实时解析并更新画布内容
2. **内容分离**：将文件内容从聊天消息中分离，分别显示在画布和聊天区域

## 与系统提示词配合

系统提示词 (`systemPrompt.ts`) 指导 AI 使用 `<write_file>` 标签输出长文内容：

```markdown
<write_file path="draft.md">
# 文章标题

内容...
</write_file>
```

前端检测到此标签后，自动打开画布并流式显示内容。
