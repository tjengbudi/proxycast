/**
 * @file WriteFile 标签解析器
 * @description 从 AI 响应中流式解析 <write_file path="xxx.md"> 标签
 * @module lib/writeFile/parser
 *
 * 支持流式解析，实时提取文件内容用于画布显示
 */

/**
 * WriteFile 解析结果
 */
export interface WriteFileBlock {
  /** 文件路径 */
  path: string;
  /** 文件内容 */
  content: string;
  /** 是否解析完成 */
  isComplete: boolean;
  /** 原始标签在文本中的起始位置 */
  startIndex: number;
  /** 原始标签在文本中的结束位置 */
  endIndex: number;
}

/**
 * 解析结果
 */
export interface WriteFileParseResult {
  /** 解析出的文件块列表 */
  blocks: WriteFileBlock[];
  /** 去除 write_file 标签后的纯文本 */
  plainText: string;
  /** 是否有正在解析中的块 */
  hasStreamingBlock: boolean;
}

/**
 * 解析器状态
 */
interface ParserState {
  /** 当前正在解析的块 */
  currentBlock: WriteFileBlock | null;
  /** 已完成的块 */
  completedBlocks: WriteFileBlock[];
  /** 纯文本部分 */
  plainTextParts: string[];
  /** 上次处理的位置 */
  lastProcessedIndex: number;
}

/**
 * WriteFile 标签解析器
 * 支持流式解析 <write_file path="xxx.md">...</write_file> 标签
 */
export class WriteFileParser {
  private state: ParserState;

  constructor() {
    this.state = {
      currentBlock: null,
      completedBlocks: [],
      plainTextParts: [],
      lastProcessedIndex: 0,
    };
  }

  /**
   * 重置解析器状态
   */
  reset(): void {
    this.state = {
      currentBlock: null,
      completedBlocks: [],
      plainTextParts: [],
      lastProcessedIndex: 0,
    };
  }

  /**
   * 解析文本内容（支持流式调用）
   * @param text 完整的文本内容（包含之前的内容）
   * @returns 解析结果
   */
  parse(text: string): WriteFileParseResult {
    // 重置状态，重新解析整个文本
    this.reset();

    let currentIndex = 0;
    const openTagRegex = /<write_file\s+path\s*=\s*["']([^"']+)["']\s*>/gi;
    const closeTag = "</write_file>";

    while (currentIndex < text.length) {
      // 如果当前在块内，查找结束标签
      if (this.state.currentBlock) {
        const closeIndex = text
          .toLowerCase()
          .indexOf(closeTag.toLowerCase(), currentIndex);

        if (closeIndex !== -1) {
          // 找到结束标签，完成当前块
          this.state.currentBlock.content = text.slice(
            this.state.currentBlock.startIndex +
              this.getOpenTagLength(text, this.state.currentBlock.startIndex),
            closeIndex,
          );
          this.state.currentBlock.isComplete = true;
          this.state.currentBlock.endIndex = closeIndex + closeTag.length;
          this.state.completedBlocks.push(this.state.currentBlock);
          this.state.currentBlock = null;
          currentIndex = closeIndex + closeTag.length;
        } else {
          // 没有找到结束标签，内容还在流式传输中
          this.state.currentBlock.content = text.slice(
            this.state.currentBlock.startIndex +
              this.getOpenTagLength(text, this.state.currentBlock.startIndex),
          );
          this.state.currentBlock.endIndex = text.length;
          break;
        }
      } else {
        // 查找开始标签
        openTagRegex.lastIndex = currentIndex;
        const match = openTagRegex.exec(text);

        if (match) {
          // 保存开始标签之前的纯文本
          if (match.index > currentIndex) {
            this.state.plainTextParts.push(
              text.slice(currentIndex, match.index),
            );
          }

          // 创建新的块
          this.state.currentBlock = {
            path: match[1],
            content: "",
            isComplete: false,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
          };
          currentIndex = match.index + match[0].length;
        } else {
          // 没有找到开始标签，剩余都是纯文本
          this.state.plainTextParts.push(text.slice(currentIndex));
          break;
        }
      }
    }

    return this.getResult();
  }

  /**
   * 获取开始标签的长度
   */
  private getOpenTagLength(text: string, startIndex: number): number {
    const openTagRegex = /<write_file\s+path\s*=\s*["'][^"']+["']\s*>/gi;
    openTagRegex.lastIndex = startIndex;
    const match = openTagRegex.exec(text);
    return match ? match[0].length : 0;
  }

  /**
   * 获取解析结果
   */
  private getResult(): WriteFileParseResult {
    const blocks = [...this.state.completedBlocks];

    // 如果有正在解析的块，也加入结果
    if (this.state.currentBlock) {
      blocks.push(this.state.currentBlock);
    }

    return {
      blocks,
      plainText: this.state.plainTextParts.join(""),
      hasStreamingBlock: this.state.currentBlock !== null,
    };
  }

  /**
   * 静态方法：一次性解析完整文本
   */
  static parse(text: string): WriteFileParseResult {
    const parser = new WriteFileParser();
    return parser.parse(text);
  }

  /**
   * 检查文本是否包含 write_file 标签
   */
  static hasWriteFileTag(text: string): boolean {
    return /<write_file\s+path\s*=\s*["'][^"']+["']\s*>/i.test(text);
  }

  /**
   * 获取第一个 write_file 块（用于快速检测）
   */
  static getFirstBlock(text: string): WriteFileBlock | null {
    const result = WriteFileParser.parse(text);
    return result.blocks.length > 0 ? result.blocks[0] : null;
  }
}

export default WriteFileParser;
