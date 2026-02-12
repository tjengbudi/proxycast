import type { AgentPageParams, WorkspaceViewMode } from "@/types/page";

export function buildHomeAgentParams(
  overrides: Partial<AgentPageParams> = {},
): AgentPageParams {
  return {
    ...overrides,
    theme: "general",
    lockTheme: false,
    newChatAt: Date.now(),
  };
}

export function buildWorkspaceResetParams(
  overrides: Partial<AgentPageParams> = {},
  workspaceViewMode: WorkspaceViewMode = "project-management",
): AgentPageParams {
  return {
    ...overrides,
    workspaceViewMode,
    workspaceResetAt: Date.now(),
  };
}
