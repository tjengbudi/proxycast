/**
 * @file BaseAgent.ts
 * @description Agent 基类，定义 Agent 的基本接口和通用方法
 * @module components/content-creator/agents/base/BaseAgent
 */

import { invoke } from "@tauri-apps/api/core";
import type { AgentConfig, AgentInput, AgentOutput } from "./types";

/**
 * Agent 基类
 *
 * 所有 Agent 都应继承此类并实现 execute 方法。
 */
export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * 获取 Agent ID
   */
  get id(): string {
    return this.config.id;
  }

  /**
   * 获取 Agent 名称
   */
  get name(): string {
    return this.config.name;
  }

  /**
   * 获取 Agent 描述
   */
  get description(): string {
    return this.config.description;
  }

  /**
   * 执行 Agent 任务
   *
   * @param input - Agent 输入
   * @returns Agent 输出
   */
  abstract execute(input: AgentInput): Promise<AgentOutput>;

  /**
   * 构建 Prompt
   *
   * @param input - Agent 输入
   * @returns Prompt 字符串
   */
  protected abstract buildPrompt(input: AgentInput): string;

  /**
   * 调用 LLM
   *
   * @param prompt - Prompt 字符串
   * @returns LLM 响应
   */
  protected async callLLM(prompt: string): Promise<Record<string, unknown>> {
    try {
      // 调用后端 LLM 服务
      const response = await invoke<string>("agent_chat", {
        agentId: this.config.id,
        message: prompt,
        model: this.config.model,
        temperature: this.config.temperature,
      });

      // 尝试解析 JSON 响应
      return this.parseResponse(response);
    } catch (error) {
      console.error(`[${this.config.id}] LLM 调用失败:`, error);
      throw error;
    }
  }

  /**
   * 解析 LLM 响应
   *
   * @param response - LLM 响应字符串
   * @returns 解析后的对象
   */
  protected parseResponse(response: string): Record<string, unknown> {
    // 尝试提取 JSON 块
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // 继续尝试其他方式
      }
    }

    // 尝试直接解析
    try {
      return JSON.parse(response);
    } catch {
      // 返回原始响应
      return { raw: response };
    }
  }

  /**
   * 验证输入
   *
   * @param input - Agent 输入
   * @param requiredFields - 必需字段
   * @throws 如果缺少必需字段
   */
  protected validateInput(input: AgentInput, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!(field in input.context)) {
        throw new Error(`缺少必需字段: ${field}`);
      }
    }
  }
}

export default BaseAgent;
