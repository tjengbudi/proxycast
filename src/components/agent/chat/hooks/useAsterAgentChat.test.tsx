import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockInitAsterAgent,
  mockSendAsterMessageStream,
  mockCreateAsterSession,
  mockListAsterSessions,
  mockGetAsterSession,
  mockStopAsterSession,
  mockConfirmAsterAction,
  mockSubmitAsterElicitationResponse,
  mockParseStreamEvent,
  mockSafeListen,
  mockToast,
} = vi.hoisted(() => ({
  mockInitAsterAgent: vi.fn(),
  mockSendAsterMessageStream: vi.fn(),
  mockCreateAsterSession: vi.fn(),
  mockListAsterSessions: vi.fn(),
  mockGetAsterSession: vi.fn(),
  mockStopAsterSession: vi.fn(),
  mockConfirmAsterAction: vi.fn(),
  mockSubmitAsterElicitationResponse: vi.fn(),
  mockParseStreamEvent: vi.fn((payload: unknown) => payload),
  mockSafeListen: vi.fn(),
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/lib/api/agent", () => ({
  initAsterAgent: mockInitAsterAgent,
  sendAsterMessageStream: mockSendAsterMessageStream,
  createAsterSession: mockCreateAsterSession,
  listAsterSessions: mockListAsterSessions,
  getAsterSession: mockGetAsterSession,
  stopAsterSession: mockStopAsterSession,
  confirmAsterAction: mockConfirmAsterAction,
  submitAsterElicitationResponse: mockSubmitAsterElicitationResponse,
  parseStreamEvent: mockParseStreamEvent,
}));

vi.mock("@/lib/dev-bridge", () => ({
  safeListen: mockSafeListen,
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

import { useAsterAgentChat } from "./useAsterAgentChat";

interface HookHarness {
  getValue: () => ReturnType<typeof useAsterAgentChat>;
  unmount: () => void;
}

function mountHook(workspaceId = "ws-test"): HookHarness {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  let hookValue: ReturnType<typeof useAsterAgentChat> | null = null;

  function TestComponent() {
    hookValue = useAsterAgentChat({ workspaceId });
    return null;
  }

  act(() => {
    root.render(<TestComponent />);
  });

  return {
    getValue: () => {
      if (!hookValue) {
        throw new Error("hook 尚未初始化");
      }
      return hookValue;
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

function seedSession(workspaceId: string, sessionId: string) {
  sessionStorage.setItem(
    `aster_curr_sessionId_${workspaceId}`,
    JSON.stringify(sessionId),
  );
  sessionStorage.setItem(
    `aster_messages_${workspaceId}`,
    JSON.stringify([
      {
        id: "m-1",
        role: "assistant",
        content: "hello",
        timestamp: new Date().toISOString(),
      },
    ]),
  );
}

beforeEach(() => {
  (
    globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean;
    }
  ).IS_REACT_ACT_ENVIRONMENT = true;

  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();

  mockInitAsterAgent.mockResolvedValue(undefined);
  mockSendAsterMessageStream.mockResolvedValue(undefined);
  mockCreateAsterSession.mockResolvedValue("created-session");
  mockListAsterSessions.mockResolvedValue([]);
  mockGetAsterSession.mockResolvedValue({
    id: "session-from-api",
    messages: [],
  });
  mockStopAsterSession.mockResolvedValue(undefined);
  mockConfirmAsterAction.mockResolvedValue(undefined);
  mockSubmitAsterElicitationResponse.mockResolvedValue(undefined);
  mockSafeListen.mockResolvedValue(() => {});
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("useAsterAgentChat.confirmAction", () => {
  it("tool_confirmation 应调用 confirmAsterAction", async () => {
    const workspaceId = "ws-tool";
    seedSession(workspaceId, "session-tool");
    const harness = mountHook(workspaceId);

    try {
      await flushEffects();
      await act(async () => {
        await harness.getValue().confirmAction({
          requestId: "req-tool-1",
          confirmed: true,
          response: "允许",
          actionType: "tool_confirmation",
        });
      });

      expect(mockConfirmAsterAction).toHaveBeenCalledTimes(1);
      expect(mockConfirmAsterAction).toHaveBeenCalledWith(
        "req-tool-1",
        true,
        "允许",
      );
      expect(mockSubmitAsterElicitationResponse).not.toHaveBeenCalled();
    } finally {
      harness.unmount();
    }
  });

  it("elicitation 应调用 submitAsterElicitationResponse 并透传 userData", async () => {
    const workspaceId = "ws-elicitation";
    seedSession(workspaceId, "session-elicitation");
    const harness = mountHook(workspaceId);

    try {
      await flushEffects();
      await act(async () => {
        await harness.getValue().confirmAction({
          requestId: "req-elicitation-1",
          confirmed: true,
          actionType: "elicitation",
          userData: { answer: "A" },
        });
      });

      expect(mockSubmitAsterElicitationResponse).toHaveBeenCalledTimes(1);
      expect(mockSubmitAsterElicitationResponse).toHaveBeenCalledWith(
        "session-elicitation",
        "req-elicitation-1",
        { answer: "A" },
      );
      expect(mockConfirmAsterAction).not.toHaveBeenCalled();
    } finally {
      harness.unmount();
    }
  });

  it("ask_user 应解析 response JSON 后提交", async () => {
    const workspaceId = "ws-ask-user";
    seedSession(workspaceId, "session-ask-user");
    const harness = mountHook(workspaceId);

    try {
      await flushEffects();
      await act(async () => {
        await harness.getValue().confirmAction({
          requestId: "req-ask-user-1",
          confirmed: true,
          actionType: "ask_user",
          response: '{"answer":"选项A"}',
        });
      });

      expect(mockSubmitAsterElicitationResponse).toHaveBeenCalledTimes(1);
      expect(mockSubmitAsterElicitationResponse).toHaveBeenCalledWith(
        "session-ask-user",
        "req-ask-user-1",
        { answer: "选项A" },
      );
    } finally {
      harness.unmount();
    }
  });
});
