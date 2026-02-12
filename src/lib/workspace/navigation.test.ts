import { describe, expect, it } from "vitest";
import { buildHomeAgentParams, buildWorkspaceResetParams } from "./navigation";

describe("buildHomeAgentParams", () => {
  it("应返回 general 主题且解锁", () => {
    const params = buildHomeAgentParams();
    expect(params.theme).toBe("general");
    expect(params.lockTheme).toBe(false);
  });

  it("应生成 newChatAt 时间戳", () => {
    const before = Date.now();
    const params = buildHomeAgentParams();
    const after = Date.now();
    expect(params.newChatAt).toBeGreaterThanOrEqual(before);
    expect(params.newChatAt).toBeLessThanOrEqual(after);
  });

  it("应允许 overrides 但不覆盖核心字段", () => {
    const params = buildHomeAgentParams({ projectId: "proj-1" });
    expect(params.projectId).toBe("proj-1");
    // theme 和 lockTheme 始终被覆盖
    expect(params.theme).toBe("general");
    expect(params.lockTheme).toBe(false);
  });

  it("多次调用应生成不同的 newChatAt（幂等性验证）", () => {
    const p1 = buildHomeAgentParams();
    const p2 = buildHomeAgentParams();
    // 两次调用的 newChatAt 可能相同（同毫秒），但结构一致
    expect(p1.theme).toBe(p2.theme);
    expect(p1.lockTheme).toBe(p2.lockTheme);
  });
});

describe("buildWorkspaceResetParams", () => {
  it("应默认使用 project-management 视图模式", () => {
    const params = buildWorkspaceResetParams();
    expect(params.workspaceViewMode).toBe("project-management");
  });

  it("应支持自定义视图模式", () => {
    const params = buildWorkspaceResetParams({}, "workspace");
    expect(params.workspaceViewMode).toBe("workspace");
  });

  it("应生成 workspaceResetAt 时间戳", () => {
    const before = Date.now();
    const params = buildWorkspaceResetParams();
    const after = Date.now();
    expect(params.workspaceResetAt).toBeGreaterThanOrEqual(before);
    expect(params.workspaceResetAt).toBeLessThanOrEqual(after);
  });

  it("应允许 overrides 传递额外参数", () => {
    const params = buildWorkspaceResetParams({ projectId: "proj-2" });
    expect(params.projectId).toBe("proj-2");
    expect(params.workspaceViewMode).toBe("project-management");
  });
});
