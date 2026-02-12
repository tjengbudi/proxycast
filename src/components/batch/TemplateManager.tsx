/**
 * 模板管理组件
 */

import React, { useState } from "react";
import styled from "styled-components";
import { Plus, Trash2, X } from "lucide-react";
import type { TaskTemplate } from "@/lib/api/batch";
import { createTemplate, deleteTemplate } from "@/lib/api/batch";

interface Props {
  templates: TaskTemplate[];
  onRefresh: () => void;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Card = styled.div`
  padding: 12px 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardName = styled.div`
  font-weight: 500;
  font-size: 14px;
`;

const CardMeta = styled.div`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
  padding: 4px;
  &:hover {
    color: hsl(0 84% 60%);
  }
  svg {
    width: 14px;
    height: 14px;
  }
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
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 48px;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
`;

// 创建模板对话框
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
  width: 480px;
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

const DialogTitle = styled.h3`
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
  margin-bottom: 14px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
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

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 13px;
  min-height: 80px;
  resize: vertical;
  box-sizing: border-box;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

export const TemplateManager: React.FC<Props> = ({ templates, onRefresh }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [model, setModel] = useState("gpt-4");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userTemplate, setUserTemplate] = useState("请处理: {{content}}");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !userTemplate.trim()) return;
    setSubmitting(true);
    try {
      await createTemplate({
        id: crypto.randomUUID(),
        name: name.trim(),
        model,
        system_prompt: systemPrompt || undefined,
        user_message_template: userTemplate,
      });
      setShowCreate(false);
      setName("");
      setSystemPrompt("");
      setUserTemplate("请处理: {{content}}");
      onRefresh();
    } catch (e) {
      console.error("[TemplateManager] 创建失败:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      onRefresh();
    } catch (e) {
      console.error("[TemplateManager] 删除失败:", e);
    }
  };

  return (
    <>
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}
      >
        <Btn onClick={() => setShowCreate(true)}>
          <Plus /> 创建模板
        </Btn>
      </div>

      <List>
        {templates.length === 0 ? (
          <Empty>暂无模板，点击"创建模板"开始</Empty>
        ) : (
          templates.map((t) => (
            <Card key={t.id}>
              <CardInfo>
                <CardName>{t.name}</CardName>
                <CardMeta>
                  模型: {t.model} | 模板:{" "}
                  {t.user_message_template.substring(0, 50)}
                  {t.user_message_template.length > 50 ? "..." : ""}
                </CardMeta>
              </CardInfo>
              <IconBtn onClick={() => handleDelete(t.id)}>
                <Trash2 />
              </IconBtn>
            </Card>
          ))
        )}
      </List>

      {showCreate && (
        <Overlay onClick={() => setShowCreate(false)}>
          <Dialog onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>创建模板</DialogTitle>
              <CloseBtn onClick={() => setShowCreate(false)}>
                <X />
              </CloseBtn>
            </DialogHeader>

            <Field>
              <Label>模板名称</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：文档翻译"
              />
            </Field>

            <Field>
              <Label>模型</Label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4"
              />
            </Field>

            <Field>
              <Label>系统提示词 (可选)</Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="你是一个专业的翻译助手..."
              />
            </Field>

            <Field>
              <Label>用户消息模板</Label>
              <Textarea
                value={userTemplate}
                onChange={(e) => setUserTemplate(e.target.value)}
                placeholder="请处理: {{content}}"
              />
            </Field>

            <Footer>
              <Btn onClick={() => setShowCreate(false)}>取消</Btn>
              <PrimaryBtn
                onClick={handleCreate}
                disabled={submitting || !name.trim()}
              >
                {submitting ? "创建中..." : "创建"}
              </PrimaryBtn>
            </Footer>
          </Dialog>
        </Overlay>
      )}
    </>
  );
};
