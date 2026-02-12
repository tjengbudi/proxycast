/**
 * 批量任务详情页
 *
 * 展示任务进度、结果和统计信息
 */

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  ArrowLeft,
  XCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import type { BatchTaskDetail as BatchTaskDetailType } from "@/lib/api/batch";
import { getBatchTask, cancelBatchTask } from "@/lib/api/batch";

interface Props {
  taskId: string;
  onBack: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  gap: 16px;
  overflow: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
  padding: 4px;
  &:hover {
    color: hsl(var(--foreground));
  }
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  flex: 1;
`;

const Btn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 13px;
  cursor: pointer;
  &:hover {
    background: hsl(var(--accent));
  }
  svg {
    width: 14px;
    height: 14px;
  }
`;

const DangerBtn = styled(Btn)`
  color: hsl(0 84% 60%);
  border-color: hsl(0 84% 60% / 0.3);
  &:hover {
    background: hsl(0 84% 60% / 0.1);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const StatCard = styled.div`
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: hsl(var(--foreground));
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-top: 2px;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: hsl(var(--muted) / 0.3);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${(p) => p.$pct}%;
  background: ${(p) => p.$color};
  transition: width 0.3s ease;
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResultCard = styled.div`
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
`;

const ResultContent = styled.pre`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow: auto;
  margin: 0;
  padding: 8px;
  background: hsl(var(--muted) / 0.2);
  border-radius: 4px;
`;

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case "completed":
      return (
        <CheckCircle
          style={{ color: "hsl(142 76% 36%)", width: 14, height: 14 }}
        />
      );
    case "failed":
      return (
        <AlertCircle
          style={{ color: "hsl(0 84% 60%)", width: 14, height: 14 }}
        />
      );
    case "cancelled":
      return (
        <XCircle style={{ color: "hsl(0 0% 50%)", width: 14, height: 14 }} />
      );
    case "running":
      return (
        <RefreshCw
          style={{ color: "hsl(217 91% 60%)", width: 14, height: 14 }}
        />
      );
    default:
      return (
        <Clock style={{ color: "hsl(0 0% 50%)", width: 14, height: 14 }} />
      );
  }
};

export const BatchTaskDetail: React.FC<Props> = ({ taskId, onBack }) => {
  const [detail, setDetail] = useState<BatchTaskDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const d = await getBatchTask(taskId);
      setDetail(d);
    } catch (e) {
      console.error("[BatchTaskDetail] 加载失败:", e);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 自动刷新运行中的任务
  useEffect(() => {
    if (!detail || detail.batch_task.status !== "running") return;
    const timer = setInterval(refresh, 2000);
    return () => clearInterval(timer);
  }, [detail, refresh]);

  const handleCancel = async () => {
    try {
      await cancelBatchTask(taskId);
      refresh();
    } catch (e) {
      console.error("[BatchTaskDetail] 取消失败:", e);
    }
  };

  if (loading || !detail) {
    return <Container>加载中...</Container>;
  }

  const { batch_task: task, statistics: stats } = detail;
  const pct =
    stats.total_tasks > 0
      ? ((stats.completed_tasks + stats.failed_tasks) / stats.total_tasks) * 100
      : 0;

  return (
    <Container>
      <Header>
        <BackBtn onClick={onBack}>
          <ArrowLeft />
        </BackBtn>
        <Title>{task.name}</Title>
        {(task.status === "running" || task.status === "pending") && (
          <DangerBtn onClick={handleCancel}>
            <XCircle /> 取消
          </DangerBtn>
        )}
      </Header>

      <ProgressBar>
        <ProgressFill $pct={pct} $color="hsl(142 76% 36%)" />
      </ProgressBar>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.total_tasks}</StatValue>
          <StatLabel>总任务</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.completed_tasks}</StatValue>
          <StatLabel>已完成</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.failed_tasks}</StatValue>
          <StatLabel>失败</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.running_tasks}</StatValue>
          <StatLabel>运行中</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.pending_tasks}</StatValue>
          <StatLabel>等待中</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.total_tokens.total_tokens}</StatValue>
          <StatLabel>总 Tokens</StatLabel>
        </StatCard>
      </StatsGrid>

      <ResultList>
        {task.results.map((r, i) => (
          <ResultCard key={r.task_id || i}>
            <ResultHeader>
              <StatusIcon status={r.status} />
              <span>任务 #{i + 1}</span>
              <span
                style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
              >
                {r.usage.total_tokens} tokens
              </span>
            </ResultHeader>
            {r.content && <ResultContent>{r.content}</ResultContent>}
            {r.error && (
              <ResultContent style={{ color: "hsl(0 84% 60%)" }}>
                {r.error}
              </ResultContent>
            )}
          </ResultCard>
        ))}
      </ResultList>
    </Container>
  );
};
