/**
 * 小说画布组件
 *
 * 用于小说项目的章节编辑
 */

import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { X, Plus, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NovelCanvasState, Chapter } from "./types";
import { countWords } from "./types";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: hsl(var(--muted) / 0.18);
  border-right: 1px solid hsl(var(--border));
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--background));
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: hsl(var(--foreground));
`;

const HeaderMeta = styled.span`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  background: hsl(var(--background));
`;

const ChapterList = styled.div`
  width: 236px;
  min-width: 236px;
  border-right: 1px solid hsl(var(--border));
  display: flex;
  flex-direction: column;
  background: hsl(var(--muted) / 0.28);
`;

const ChapterListHeader = styled.div`
  padding: 12px;
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: hsl(var(--background));
`;

const ChapterListBody = styled.div`
  padding: 8px;
`;

const ChapterItem = styled.div<{ $active?: boolean }>`
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid
    ${({ $active }) =>
      $active ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border))"};
  border-radius: 10px;
  background: ${({ $active }) =>
    $active ? "hsl(var(--accent) / 0.55)" : "hsl(var(--background))"};
  box-shadow: ${({ $active }) =>
    $active ? "0 2px 8px hsl(var(--primary) / 0.12)" : "none"};
  transition: all 0.18s ease;

  &:hover {
    background: hsl(var(--accent) / 0.42);
    border-color: hsl(var(--primary) / 0.28);
  }
`;

const ChapterTitle = styled.div`
  font-weight: 500;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: hsl(var(--foreground));
`;

const ChapterTitleText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChapterMeta = styled.div`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 6px;
`;

const EditorArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: hsl(var(--background));
`;

const ChapterHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  gap: 12px;
  align-items: center;
  background: hsl(var(--muted) / 0.16);
`;

const EditorContainer = styled.div`
  flex: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const Editor = styled(Textarea)`
  flex: 1;
  min-height: 0;
  font-size: 16px;
  line-height: 1.95;
  resize: none;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  background: hsl(var(--background));
  padding: 18px 20px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);

  &:focus {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 3px hsl(var(--primary) / 0.12);
  }
`;

const EmptyEditorState = styled.div`
  flex: 1;
  border: 1px dashed hsl(var(--border));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
`;

const StatusBar = styled.div`
  padding: 9px 16px;
  border-top: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--background));
`;

interface NovelCanvasProps {
  state: NovelCanvasState;
  onStateChange: (state: NovelCanvasState) => void;
  onClose: () => void;
}

export const NovelCanvas: React.FC<NovelCanvasProps> = memo(
  ({ state, onStateChange, onClose }) => {
    const currentChapter = state.chapters.find(
      (c) => c.id === state.currentChapterId,
    );

    const handleChapterSelect = useCallback(
      (chapterId: string) => {
        onStateChange({ ...state, currentChapterId: chapterId });
      },
      [state, onStateChange],
    );

    const handleAddChapter = useCallback(() => {
      const now = Date.now();
      const newChapter: Chapter = {
        id: crypto.randomUUID(),
        number: state.chapters.length + 1,
        title: `第${state.chapters.length + 1}章`,
        content: "",
        wordCount: 0,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      };
      onStateChange({
        ...state,
        chapters: [...state.chapters, newChapter],
        currentChapterId: newChapter.id,
      });
    }, [state, onStateChange]);

    const handleUpdateChapter = useCallback(
      (updates: Partial<Chapter>) => {
        if (!currentChapter) return;
        const now = Date.now();
        const updatedChapters = state.chapters.map((c) =>
          c.id === currentChapter.id
            ? {
                ...c,
                ...updates,
                wordCount: updates.content
                  ? countWords(updates.content)
                  : c.wordCount,
                updatedAt: now,
              }
            : c,
        );
        onStateChange({ ...state, chapters: updatedChapters });
      },
      [state, currentChapter, onStateChange],
    );

    const totalWords = state.chapters.reduce((sum, c) => sum + c.wordCount, 0);
    const completedCount = state.chapters.filter(
      (c) => c.status === "completed",
    ).length;

    return (
      <Container>
        <Header>
          <HeaderInfo>
            <Title>小说编辑器</Title>
            <HeaderMeta>
              {state.chapters.length} 章 · {totalWords} 字
            </HeaderMeta>
          </HeaderInfo>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </Header>

        <Content>
          <ChapterList>
            <ChapterListHeader>
              <span className="text-sm font-medium">章节</span>
              <Button variant="ghost" size="icon" onClick={handleAddChapter}>
                <Plus className="h-4 w-4" />
              </Button>
            </ChapterListHeader>
            <ScrollArea className="flex-1">
              <ChapterListBody>
                {state.chapters.map((chapter) => (
                  <ChapterItem
                    key={chapter.id}
                    $active={chapter.id === state.currentChapterId}
                    onClick={() => handleChapterSelect(chapter.id)}
                  >
                    <ChapterTitle>
                      {chapter.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                      <ChapterTitleText>{chapter.title}</ChapterTitleText>
                    </ChapterTitle>
                    <ChapterMeta>{chapter.wordCount} 字</ChapterMeta>
                  </ChapterItem>
                ))}
              </ChapterListBody>
            </ScrollArea>
          </ChapterList>

          <EditorArea>
            {currentChapter && (
              <>
                <ChapterHeader>
                  <Input
                    value={currentChapter.title}
                    onChange={(e) =>
                      handleUpdateChapter({ title: e.target.value })
                    }
                    placeholder="章节标题"
                    className="text-lg font-medium"
                  />
                  <Button
                    variant={
                      currentChapter.status === "completed"
                        ? "secondary"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleUpdateChapter({
                        status:
                          currentChapter.status === "completed"
                            ? "draft"
                            : "completed",
                      })
                    }
                  >
                    {currentChapter.status === "completed"
                      ? "已完成"
                      : "标记完成"}
                  </Button>
                </ChapterHeader>

                <EditorContainer>
                  <Editor
                    value={currentChapter.content}
                    onChange={(e) =>
                      handleUpdateChapter({ content: e.target.value })
                    }
                    placeholder="开始写作..."
                  />
                </EditorContainer>
              </>
            )}

            {!currentChapter && (
              <EditorContainer>
                <EmptyEditorState>
                  请先选择章节，或在左侧新建章节开始创作
                </EmptyEditorState>
              </EditorContainer>
            )}
          </EditorArea>
        </Content>

        <StatusBar>
          <span>
            {completedCount}/{state.chapters.length} 章完成
          </span>
          <span>总字数：{totalWords.toLocaleString()}</span>
        </StatusBar>
      </Container>
    );
  },
);

NovelCanvas.displayName = "NovelCanvas";
