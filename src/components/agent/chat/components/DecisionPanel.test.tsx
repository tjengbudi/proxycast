import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DecisionPanel } from "./DecisionPanel";
import type { ActionRequired, ConfirmResponse } from "../types";

interface RenderResult {
  container: HTMLDivElement;
  root: Root;
  onSubmit: ReturnType<typeof vi.fn<(response: ConfirmResponse) => void>>;
}

const mountedRoots: Array<{ root: Root; container: HTMLDivElement }> = [];

beforeEach(() => {
  (
    globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean;
    }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

function renderDecisionPanel(request: ActionRequired): RenderResult {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const onSubmit = vi.fn<(response: ConfirmResponse) => void>();

  act(() => {
    root.render(<DecisionPanel request={request} onSubmit={onSubmit} />);
  });

  mountedRoots.push({ root, container });
  return { container, root, onSubmit };
}

function findButtonByText(
  container: HTMLElement,
  text: string,
): HTMLButtonElement {
  const target = Array.from(container.querySelectorAll("button")).find((node) =>
    node.textContent?.includes(text),
  );
  if (!target) {
    throw new Error(`未找到按钮: ${text}`);
  }
  return target as HTMLButtonElement;
}

function findInputByPlaceholder(
  container: HTMLElement,
  placeholder: string,
): HTMLInputElement {
  const target = container.querySelector<HTMLInputElement>(
    `input[placeholder="${placeholder}"]`,
  );
  if (!target) {
    throw new Error(`未找到输入框: ${placeholder}`);
  }
  return target;
}

function clickButton(button: HTMLButtonElement) {
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function createElicitationRequest(requestId: string): ActionRequired {
  return {
    requestId,
    actionType: "elicitation",
    prompt: "请选择部署环境",
    requestedSchema: {
      properties: {
        answer: {
          description: "请选择一个环境",
          enum: ["开发环境", "生产环境"],
        },
      },
    },
  };
}

afterEach(() => {
  while (mountedRoots.length > 0) {
    const mounted = mountedRoots.pop();
    if (!mounted) break;
    act(() => {
      mounted.root.unmount();
    });
    mounted.container.remove();
  }
  vi.clearAllMocks();
});

describe("DecisionPanel elicitation", () => {
  it("应支持从 enum 选项选择并提交 userData.answer", () => {
    const request = createElicitationRequest("req-elicitation-option");
    const { container, onSubmit } = renderDecisionPanel(request);

    const submitButton = findButtonByText(container, "提交");
    expect(submitButton.disabled).toBe(true);

    clickButton(findButtonByText(container, "生产环境"));
    const answerInput = findInputByPlaceholder(container, "请输入回答...");
    expect(answerInput.value).toBe("生产环境");

    clickButton(findButtonByText(container, "提交"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      requestId: "req-elicitation-option",
      confirmed: true,
      response: JSON.stringify({ answer: "生产环境" }),
      actionType: "elicitation",
      userData: { answer: "生产环境" },
    });
  });

  it("取消时应返回拒绝响应", () => {
    const request = createElicitationRequest("req-elicitation-cancel");
    const { container, onSubmit } = renderDecisionPanel(request);

    clickButton(findButtonByText(container, "取消"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.requestId).toBe("req-elicitation-cancel");
    expect(payload.confirmed).toBe(false);
    expect(payload.actionType).toBe("elicitation");
    expect(payload.response).toBe("用户拒绝了请求");
    expect(payload.userData).toBe("");
  });
});
