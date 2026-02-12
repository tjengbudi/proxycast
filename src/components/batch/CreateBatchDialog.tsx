/**
 * 创建批量任务对话框
 */

import React, { useState } from "react";
import styled from "styled-components";
import { X } from "lucide-react";
import type { TaskTemplate } from "@/lib/api/batch";
import { createBatchTask } from "@/lib/api/batch";

interface Props {
  templates: TaskTemplate[];
  onClose: () => void;
  onCreated: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Dialog = styled.div`
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  width: 560px;
  max-height: 80vh;
  overflow: auto;
  padding: 24px;
`;

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DialogTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
  padding: 4px;
  &:hover {
    color: hsl(var(--foreground));
  }
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: hsl(var(--foreground));
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 13px;
  box-sizing: border-box;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 13px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 13px;
  font-family: monospace;
  min-height: 120px;
  resize: vertical;
  box-sizing: border-box;
`;

const HelpText = styled.p`
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

const Btn = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 13px;
  cursor: pointer;
  &:hover {
    background: hsl(var(--accent));
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
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  color: hsl(0 84% 60%);
  font-size: 12px;
  margin-top: 8px;
`;

export const CreateBatchDialog: React.FC<Props> = ({
  templates,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState(templates[0]?.id || "");
  const [tasksJson, setTasksJson] = useState(
    JSON.stringify([{ variables: { content: "示例内容" } }], null, 2),
  );
  const [concurrency, setConcurrency] = useState(3);
  const [retryCount, setRetryCount] = useState(0);
  const [timeoutSecs, setTimeoutSecs] = useState(120);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("请输入任务名称");
      return;
    }
    if (!templateId) {
      setError("请选择模板");
      return;
    }

    let tasks;
    try {
      tasks = JSON.parse(tasksJson);
      if (!Array.isArray(tasks) || tasks.length === 0) {
        setError("任务列表必须是非空数组");
        return;
      }
    } catch {
      setError("任务列表 JSON 格式错误");
      return;
    }

    setSubmitting(true);
    try {
      await createBatchTask({
        name: name.trim(),
        template_id: templateId,
        tasks,
        options: {
          concurrency,
          retry_count: retryCount,
          timeout_seconds: timeoutSecs,
          continue_on_error: true,
        },
      });
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>创建批量任务</DialogTitle>
          <CloseBtn onClick={onClose}>
            <X />
          </CloseBtn>
        </DialogHeader>

        <Field>
          <Label>任务名称</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：批量翻译文档"
          />
        </Field>

        <Field>
          <Label>选择模板</Label>
          <Select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          >
            {templates.length === 0 && (
              <option value="">暂无模板，请先创建</option>
            )}
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.model})
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          <Label>任务列表 (JSON)</Label>
          <Textarea
            value={tasksJson}
            onChange={(e) => setTasksJson(e.target.value)}
          />
          <HelpText>
            每个任务包含 variables 对象，键名对应模板中的 {"{{变量名}}"} 占位符
          </HelpText>
        </Field>

        <Field>
          <Label>并发数</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={concurrency}
            onChange={(e) => setConcurrency(Number(e.target.value))}
          />
        </Field>

        <Field>
          <Label>重试次数</Label>
          <Input
            type="number"
            min={0}
            max={5}
            value={retryCount}
            onChange={(e) => setRetryCount(Number(e.target.value))}
          />
        </Field>

        <Field>
          <Label>超时时间 (秒)</Label>
          <Input
            type="number"
            min={10}
            max={600}
            value={timeoutSecs}
            onChange={(e) => setTimeoutSecs(Number(e.target.value))}
          />
        </Field>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <Footer>
          <Btn onClick={onClose}>取消</Btn>
          <PrimaryBtn onClick={handleSubmit} disabled={submitting}>
            {submitting ? "创建中..." : "创建并执行"}
          </PrimaryBtn>
        </Footer>
      </Dialog>
    </Overlay>
  );
};
