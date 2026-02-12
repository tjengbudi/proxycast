/**
 * 批量任务主页面
 *
 * 展示任务列表、创建入口和模板管理
 */

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Plus, RefreshCw, Layers, FileText } from "lucide-react";
import type { Page } from "@/types/page";
import type { BatchTask, TaskTemplate } from "@/lib/api/batch";
import { listBatchTasks, listTemplates } from "@/lib/api/batch";
import { CreateBatchDialog } from "./CreateBatchDialog";
import { BatchTaskDetail } from "./BatchTaskDetail";
import { TemplateManager } from "./TemplateManager";

interface BatchPageProps {
  onNavigate?: (page: Page) => void;
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
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: hsl(var(--foreground));
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
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

const PrimaryBtn = styled(Btn)`
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
  &:hover {
    opacity: 0.9;
    background: hsl(var(--primary));
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid hsl(var(--border));
  padding-bottom: 0;
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: none;
  color: ${(p) =>
    p.$active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"};
  border-bottom: 2px solid
    ${(p) => (p.$active ? "hsl(var(--primary))" : "transparent")};
  cursor: pointer;
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  svg {
    width: 14px;
    height: 14px;
  }
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TaskCard = styled.div`
  padding: 12px 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: hsl(var(--accent));
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TaskName = styled.span`
  font-weight: 500;
  font-size: 14px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  background: ${(p) => {
    switch (p.$status) {
      case "completed":
        return "hsl(142 76% 36% / 0.15)";
      case "running":
        return "hsl(217 91% 60% / 0.15)";
      case "failed":
        return "hsl(0 84% 60% / 0.15)";
      case "cancelled":
        return "hsl(0 0% 50% / 0.15)";
      case "partiallycompleted":
        return "hsl(38 92% 50% / 0.15)";
      default:
        return "hsl(0 0% 50% / 0.1)";
    }
  }};
  color: ${(p) => {
    switch (p.$status) {
      case "completed":
        return "hsl(142 76% 36%)";
      case "running":
        return "hsl(217 91% 60%)";
      case "failed":
        return "hsl(0 84% 60%)";
      case "cancelled":
        return "hsl(0 0% 50%)";
      case "partiallycompleted":
        return "hsl(38 92% 50%)";
      default:
        return "hsl(0 0% 50%)";
    }
  }};
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const Empty = styled.div`
  text-align: center;
  padding: 48px;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
`;

const STATUS_LABELS: Record<string, string> = {
  pending: "等待中",
  running: "运行中",
  completed: "已完成",
  partiallycompleted: "部分完成",
  failed: "失败",
  cancelled: "已取消",
};

export const BatchPage: React.FC<BatchPageProps> = () => {
  const [tab, setTab] = useState<"tasks" | "templates">("tasks");
  const [tasks, setTasks] = useState<BatchTask[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [t, tpl] = await Promise.all([listBatchTasks(), listTemplates()]);
      setTasks(t);
      setTemplates(tpl);
    } catch (e) {
      console.error("[BatchPage] 加载失败:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 自动刷新运行中的任务
  useEffect(() => {
    const hasRunning = tasks.some((t) => t.status === "running");
    if (!hasRunning) return;
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [tasks, refresh]);

  if (selectedTaskId) {
    return (
      <BatchTaskDetail
        taskId={selectedTaskId}
        onBack={() => {
          setSelectedTaskId(null);
          refresh();
        }}
      />
    );
  }

  return (
    <Container>
      <Header>
        <Title>批量任务</Title>
        <Actions>
          <Btn onClick={refresh} disabled={loading}>
            <RefreshCw /> 刷新
          </Btn>
          <PrimaryBtn onClick={() => setShowCreate(true)}>
            <Plus /> 创建任务
          </PrimaryBtn>
        </Actions>
      </Header>

      <Tabs>
        <Tab $active={tab === "tasks"} onClick={() => setTab("tasks")}>
          <Layers /> 任务列表
        </Tab>
        <Tab $active={tab === "templates"} onClick={() => setTab("templates")}>
          <FileText /> 模板管理
        </Tab>
      </Tabs>

      {tab === "tasks" && (
        <TaskList>
          {tasks.length === 0 ? (
            <Empty>暂无批量任务，点击"创建任务"开始</Empty>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <TaskHeader>
                  <TaskName>{task.name}</TaskName>
                  <StatusBadge $status={task.status}>
                    {STATUS_LABELS[task.status] || task.status}
                  </StatusBadge>
                </TaskHeader>
                <TaskMeta>
                  <span>子任务: {task.tasks.length}</span>
                  <span>
                    完成:{" "}
                    {
                      task.results.filter((r) => r.status === "completed")
                        .length
                    }
                  </span>
                  <span>{new Date(task.created_at).toLocaleString()}</span>
                </TaskMeta>
              </TaskCard>
            ))
          )}
        </TaskList>
      )}

      {tab === "templates" && (
        <TemplateManager templates={templates} onRefresh={refresh} />
      )}

      {showCreate && (
        <CreateBatchDialog
          templates={templates}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refresh();
          }}
        />
      )}
    </Container>
  );
};
