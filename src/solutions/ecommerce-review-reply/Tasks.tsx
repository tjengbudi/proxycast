/**
 * 电商差评回复 - 任务列表
 *
 * 管理差评回复任务,支持批量添加和执行
 */

import { useState } from "react";
import styled from "styled-components";
import type { ReviewTask, EcommerceConfig } from "./index";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: hsl(var(--card));
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: hsl(var(--foreground));
`;

const AddTaskForm = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
  }
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  ${(props) =>
    props.variant === "primary"
      ? `
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border: none;

    &:hover {
      opacity: 0.9;
    }
  `
      : `
    background-color: transparent;
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));

    &:hover {
      background-color: hsl(var(--muted));
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 500px;
  overflow-y: auto;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: hsl(var(--background));
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
`;

const TaskInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskUrl = styled.div`
  font-size: 14px;
  color: hsl(var(--foreground));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TaskStatus = styled.div<{ status: ReviewTask["status"] }>`
  font-size: 12px;
  color: ${(props) => {
    switch (props.status) {
      case "pending":
        return "hsl(var(--muted-foreground))";
      case "processing":
        return "hsl(var(--primary))";
      case "completed":
        return "hsl(142, 76%, 36%)";
      case "failed":
        return "hsl(var(--destructive))";
    }
  }};
`;

const TaskActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: hsl(var(--muted-foreground));
`;

const ConfigInfo = styled.div`
  padding: 12px;
  background-color: hsl(var(--muted));
  border-radius: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

interface TasksProps {
  tasks: ReviewTask[];
  config: EcommerceConfig;
  onAddTask: (reviewUrl: string) => void;
  onExecuteTask: (taskId: string) => void;
}

export function Tasks({ tasks, config, onAddTask, onExecuteTask }: TasksProps) {
  const [newTaskUrl, setNewTaskUrl] = useState("");

  const handleAddTask = () => {
    if (newTaskUrl.trim()) {
      onAddTask(newTaskUrl.trim());
      setNewTaskUrl("");
    }
  };

  const getStatusText = (status: ReviewTask["status"]) => {
    switch (status) {
      case "pending":
        return "待处理";
      case "processing":
        return "处理中...";
      case "completed":
        return "已完成";
      case "failed":
        return "失败";
    }
  };

  const getPlatformName = () => {
    switch (config.platform) {
      case "taobao":
        return "淘宝";
      case "jd":
        return "京东";
      case "pinduoduo":
        return "拼多多";
    }
  };

  return (
    <Container>
      <Header>
        <Title>差评任务列表</Title>
      </Header>

      <ConfigInfo>
        当前配置: {getPlatformName()} | {config.aiModel.primary} |{" "}
        {config.replyRules.tone === "polite"
          ? "礼貌"
          : config.replyRules.tone === "sincere"
            ? "真诚"
            : "专业"}
        语气
      </ConfigInfo>

      <AddTaskForm>
        <Input
          type="url"
          placeholder="粘贴差评链接..."
          value={newTaskUrl}
          onChange={(e) => setNewTaskUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddTask();
            }
          }}
        />
        <Button variant="primary" onClick={handleAddTask}>
          添加任务
        </Button>
      </AddTaskForm>

      {tasks.length === 0 ? (
        <EmptyState>
          <p>暂无任务</p>
          <p style={{ fontSize: "12px", marginTop: "8px" }}>
            粘贴差评链接开始处理
          </p>
        </EmptyState>
      ) : (
        <TaskList>
          {tasks.map((task) => (
            <TaskItem key={task.id}>
              <TaskInfo>
                <TaskUrl title={task.reviewUrl}>{task.reviewUrl}</TaskUrl>
                <TaskStatus status={task.status}>
                  {getStatusText(task.status)}
                </TaskStatus>
              </TaskInfo>
              <TaskActions>
                {task.status === "pending" && (
                  <Button
                    variant="primary"
                    onClick={() => onExecuteTask(task.id)}
                  >
                    执行
                  </Button>
                )}
                {task.status === "failed" && (
                  <Button onClick={() => onExecuteTask(task.id)}>重试</Button>
                )}
              </TaskActions>
            </TaskItem>
          ))}
        </TaskList>
      )}
    </Container>
  );
}
