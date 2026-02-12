/**
 * @file 钢琴谱渲染组件
 * @description 简化版钢琴卷帘视图，显示音符在钢琴键上的位置
 */

import React, { memo, useMemo } from "react";
import styled from "styled-components";
import type { MusicSection, Note } from "../types";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
  overflow-y: auto;
`;

const SectionBlock = styled.div<{ $isSelected: boolean }>`
  padding: 16px;
  border-radius: 8px;
  background: ${({ $isSelected }) =>
    $isSelected ? "hsl(var(--accent) / 0.1)" : "hsl(var(--muted) / 0.3)"};
  border: 1px solid
    ${({ $isSelected }) =>
      $isSelected ? "hsl(var(--accent))" : "hsl(var(--border))"};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: hsl(var(--accent) / 0.05);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const SectionTag = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  border: 1px solid hsl(var(--primary) / 0.2);
  padding: 2px 8px;
  border-radius: 4px;
`;

const PianoRollContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-x: auto;
`;

const PianoRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: 8px;
  background: hsl(var(--background));
  border-radius: 4px;
`;

const KeyboardContainer = styled.div`
  display: flex;
  position: relative;
  height: 80px;
`;

const WhiteKey = styled.div<{ $isActive: boolean }>`
  width: 24px;
  height: 80px;
  background: ${({ $isActive }) =>
    $isActive ? "hsl(var(--primary))" : "white"};
  border: 1px solid hsl(var(--border));
  border-radius: 0 0 4px 4px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
  font-size: 10px;
  color: ${({ $isActive }) =>
    $isActive ? "white" : "hsl(var(--muted-foreground))"};
  transition: background 0.1s;
`;

const BlackKey = styled.div<{ $isActive: boolean; $offset: number }>`
  position: absolute;
  left: ${({ $offset }) => $offset}px;
  width: 16px;
  height: 50px;
  background: ${({ $isActive }) =>
    $isActive ? "hsl(var(--primary))" : "hsl(var(--foreground))"};
  border-radius: 0 0 2px 2px;
  z-index: 1;
  transition: background 0.1s;
`;

const ChordLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--primary));
  margin-bottom: 4px;
`;

const LyricsLabel = styled.div`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
  text-align: center;
`;

const BarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-right: 1px solid hsl(var(--border));

  &:last-child {
    border-right: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: hsl(var(--muted-foreground));
  text-align: center;
`;

const HintBox = styled.div`
  margin-top: 12px;
  padding: 8px;
  background: hsl(var(--muted) / 0.5);
  border-radius: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const LyricsLine = styled.div`
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  line-height: 1.8;
`;

interface PianoRollRendererProps {
  sections: MusicSection[];
  currentSectionId: string | null;
  onSectionSelect: (id: string) => void;
}

// 白键音符名称
const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
// 黑键位置（相对于白键的偏移）
const BLACK_KEY_OFFSETS = [17, 41, null, 89, 113, 137, null]; // null 表示没有黑键

/**
 * 简谱音高转换为钢琴键索引
 * 1=C, 2=D, 3=E, 4=F, 5=G, 6=A, 7=B
 */
function pitchToKeyIndex(pitch: number, octave: number): number {
  if (pitch === 0) return -1; // 休止符
  const baseIndex = pitch - 1; // 0-6
  return baseIndex + octave * 7;
}

/**
 * 迷你钢琴键盘组件
 */
const MiniPiano: React.FC<{ activeNotes: Note[] }> = memo(({ activeNotes }) => {
  // 计算活跃的键
  const activeKeys = useMemo(() => {
    const keys = new Set<number>();
    for (const note of activeNotes) {
      if (note.pitch > 0) {
        const keyIndex = pitchToKeyIndex(note.pitch, note.octave);
        keys.add(keyIndex);
      }
    }
    return keys;
  }, [activeNotes]);

  // 渲染一个八度的钢琴键
  const renderOctave = (octaveOffset: number) => {
    return (
      <KeyboardContainer key={octaveOffset}>
        {/* 白键 */}
        {WHITE_KEYS.map((key, index) => {
          const keyIndex = index + octaveOffset * 7;
          const isActive = activeKeys.has(keyIndex);
          return (
            <WhiteKey
              key={`white-${octaveOffset}-${index}`}
              $isActive={isActive}
            >
              {octaveOffset === 0 && key}
            </WhiteKey>
          );
        })}
        {/* 黑键 */}
        {BLACK_KEY_OFFSETS.map((offset, index) => {
          if (offset === null) return null;
          const _keyIndex = index + octaveOffset * 7 + 0.5; // 黑键用 .5 表示
          const isActive = false; // 简谱不支持黑键
          return (
            <BlackKey
              key={`black-${octaveOffset}-${index}`}
              $isActive={isActive}
              $offset={offset + octaveOffset * 168}
            />
          );
        })}
      </KeyboardContainer>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      {/* 低音区 */}
      {renderOctave(-1)}
      {/* 中音区 */}
      {renderOctave(0)}
      {/* 高音区 */}
      {renderOctave(1)}
    </div>
  );
});

MiniPiano.displayName = "MiniPiano";

/**
 * 钢琴谱渲染组件
 */
export const PianoRollRenderer: React.FC<PianoRollRendererProps> = memo(
  ({ sections, currentSectionId, onSectionSelect }) => {
    // 检查是否有音符数据
    const hasNoteData = useMemo(() => {
      return sections.some((section) =>
        section.bars.some((bar) => bar.notes.length > 0),
      );
    }, [sections]);

    if (sections.length === 0) {
      return (
        <EmptyState>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎹</div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            暂无钢琴谱数据
          </div>
          <div style={{ fontSize: "14px", marginTop: "8px" }}>
            请在创作时要求 AI 生成带简谱的歌词
          </div>
        </EmptyState>
      );
    }

    if (!hasNoteData) {
      // 没有音符数据，显示歌词和提示
      return (
        <Container>
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              $isSelected={section.id === currentSectionId}
              onClick={() => onSectionSelect(section.id)}
            >
              <SectionHeader>
                <SectionTag>[{section.type.toUpperCase()}]</SectionTag>
                <span
                  style={{
                    color: "hsl(var(--muted-foreground))",
                    fontSize: "13px",
                  }}
                >
                  {section.name}
                </span>
              </SectionHeader>
              <div>
                {section.lyricsLines.map((line, index) => (
                  <LyricsLine key={index}>{line}</LyricsLine>
                ))}
              </div>
              <HintBox>
                💡 提示：要显示钢琴谱，请在创作时要求 AI 使用简谱格式输出（如 1
                2 3 4 5 6 7）
              </HintBox>
            </SectionBlock>
          ))}
        </Container>
      );
    }

    return (
      <Container>
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            $isSelected={section.id === currentSectionId}
            onClick={() => onSectionSelect(section.id)}
          >
            <SectionHeader>
              <SectionTag>[{section.type.toUpperCase()}]</SectionTag>
              <span
                style={{
                  color: "hsl(var(--muted-foreground))",
                  fontSize: "13px",
                }}
              >
                {section.name}
              </span>
            </SectionHeader>

            <PianoRollContainer>
              <PianoRow>
                {section.bars.map((bar) => (
                  <BarContainer key={bar.id}>
                    {bar.chord && <ChordLabel>{bar.chord}</ChordLabel>}
                    <MiniPiano activeNotes={bar.notes} />
                    {bar.lyrics && <LyricsLabel>{bar.lyrics}</LyricsLabel>}
                  </BarContainer>
                ))}
              </PianoRow>
            </PianoRollContainer>

            {/* 歌词行（如果小节没有歌词） */}
            {section.lyricsLines.length > 0 &&
              section.bars.every((b) => !b.lyrics) && (
                <div style={{ marginTop: "12px" }}>
                  {section.lyricsLines.map((line, index) => (
                    <LyricsLine key={index}>{line}</LyricsLine>
                  ))}
                </div>
              )}
          </SectionBlock>
        ))}
      </Container>
    );
  },
);

PianoRollRenderer.displayName = "PianoRollRenderer";

export default PianoRollRenderer;
