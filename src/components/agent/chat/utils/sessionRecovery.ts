export interface TopicSessionRef {
  id: string;
}

export interface ResolveRestorableSessionIdOptions {
  workspaceId: string;
  topics: TopicSessionRef[];
  scopedTransientCandidate: string | null;
  scopedPersistedCandidate: string | null;
  legacyCandidate: string | null;
  resolveWorkspaceIdBySessionId: (sessionId: string) => string | null;
}

export function isValidSessionId(
  sessionId: string | null | undefined,
): sessionId is string {
  const normalized = sessionId?.trim();
  if (!normalized) {
    return false;
  }

  if (normalized.includes("/") || normalized.includes("[object Promise]")) {
    return false;
  }

  return true;
}

export function resolveRestorableSessionId({
  workspaceId,
  topics,
  scopedTransientCandidate,
  scopedPersistedCandidate,
  legacyCandidate,
  resolveWorkspaceIdBySessionId,
}: ResolveRestorableSessionIdOptions): string | null {
  if (!workspaceId || topics.length === 0) {
    return null;
  }

  const topicIdSet = new Set(topics.map((topic) => topic.id));

  const normalizeCandidate = (candidate: string | null): string | null => {
    if (!isValidSessionId(candidate)) {
      return null;
    }

    if (!topicIdSet.has(candidate)) {
      return null;
    }

    const candidateWorkspaceId = resolveWorkspaceIdBySessionId(candidate);
    if (candidateWorkspaceId !== workspaceId) {
      return null;
    }

    return candidate;
  };

  const scopedTransient = normalizeCandidate(scopedTransientCandidate);
  if (scopedTransient) {
    return scopedTransient;
  }

  const scopedPersisted = normalizeCandidate(scopedPersistedCandidate);
  if (scopedPersisted) {
    return scopedPersisted;
  }

  const legacy = normalizeCandidate(legacyCandidate);
  if (legacy) {
    return legacy;
  }

  const fallback = topics[0]?.id ?? null;
  if (!isValidSessionId(fallback)) {
    return null;
  }

  const fallbackWorkspaceId = resolveWorkspaceIdBySessionId(fallback);
  if (fallbackWorkspaceId && fallbackWorkspaceId !== workspaceId) {
    return null;
  }

  return fallback;
}
