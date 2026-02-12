import { describe, expect, it } from "vitest";
import {
  isValidSessionId,
  resolveRestorableSessionId,
} from "./sessionRecovery";

describe("isValidSessionId", () => {
  it("应拒绝空值与空字符串", () => {
    expect(isValidSessionId(null)).toBe(false);
    expect(isValidSessionId(undefined)).toBe(false);
    expect(isValidSessionId("   ")).toBe(false);
  });

  it("应拒绝已知非法会话 ID", () => {
    expect(isValidSessionId("abc/def")).toBe(false);
    expect(isValidSessionId("[object Promise]")).toBe(false);
  });

  it("应接受正常会话 ID", () => {
    expect(isValidSessionId("session_123")).toBe(true);
    expect(isValidSessionId("f65b8b87-9b5b-4312-9cd4-8f55f20cb5dd")).toBe(true);
  });
});

describe("resolveRestorableSessionId", () => {
  const workspaceMap: Record<string, string | null> = {
    s1: "ws-a",
    s2: "ws-a",
    s3: "ws-a",
    s4: "ws-b",
  };

  const resolveWorkspaceIdBySessionId = (sessionId: string) =>
    workspaceMap[sessionId] ?? null;

  const topics = [{ id: "s1" }, { id: "s2" }, { id: "s4" }];

  it("应优先使用 scoped transient 候选", () => {
    const result = resolveRestorableSessionId({
      workspaceId: "ws-a",
      topics,
      scopedTransientCandidate: "s2",
      scopedPersistedCandidate: "s1",
      legacyCandidate: "s3",
      resolveWorkspaceIdBySessionId,
    });

    expect(result).toBe("s2");
  });

  it("应在 transient 非法时使用 scoped persisted", () => {
    const result = resolveRestorableSessionId({
      workspaceId: "ws-a",
      topics,
      scopedTransientCandidate: "[object Promise]",
      scopedPersistedCandidate: "s1",
      legacyCandidate: "s3",
      resolveWorkspaceIdBySessionId,
    });

    expect(result).toBe("s1");
  });

  it("应在 scoped 候选失效时回退到 legacy", () => {
    const result = resolveRestorableSessionId({
      workspaceId: "ws-a",
      topics,
      scopedTransientCandidate: "s4",
      scopedPersistedCandidate: "unknown",
      legacyCandidate: "s1",
      resolveWorkspaceIdBySessionId,
    });

    expect(result).toBe("s1");
  });

  it("应拒绝跨 workspace 候选并回退到 topics 首项", () => {
    const result = resolveRestorableSessionId({
      workspaceId: "ws-a",
      topics,
      scopedTransientCandidate: "s4",
      scopedPersistedCandidate: "s4",
      legacyCandidate: "s4",
      resolveWorkspaceIdBySessionId,
    });

    expect(result).toBe("s1");
  });

  it("应在缺失 topics 时返回 null", () => {
    const result = resolveRestorableSessionId({
      workspaceId: "ws-a",
      topics: [],
      scopedTransientCandidate: "s1",
      scopedPersistedCandidate: "s1",
      legacyCandidate: "s1",
      resolveWorkspaceIdBySessionId,
    });

    expect(result).toBeNull();
  });
});
