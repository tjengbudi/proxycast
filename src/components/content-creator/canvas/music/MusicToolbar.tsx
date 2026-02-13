/**
 * @file 音乐画布工具栏
 * @description 提供视图切换、播放控制、导出等功能
 * @module components/content-creator/canvas/music/MusicToolbar
 */

import React, { memo } from "react";
import styled from "styled-components";
import {
  Play,
  Pause,
  Undo2,
  Redo2,
  Download,
  X,
  Music,
  FileText,
  Guitar,
  Piano,
} from "lucide-react";
import type { MusicToolbarProps, MusicViewMode } from "./types";
import { VIEW_MODE_LABELS } from "./types";

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  background: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
  min-height: 48px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const CenterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const ThemeLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-right: 12px;
`;

const SongTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SongMeta = styled.span`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-left: 8px;
  white-space: nowrap;
`;

const IconButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) =>
    $active ? "hsl(var(--accent))" : "transparent"};
  color: ${({ $active }) =>
    $active ? "hsl(var(--accent-foreground))" : "hsl(var(--foreground))"};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $active }) =>
      $active ? "hsl(var(--accent))" : "hsl(var(--muted))"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ViewModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  background: ${({ $active }) =>
    $active ? "hsl(var(--accent))" : "transparent"};
  color: ${({ $active }) =>
    $active ? "hsl(var(--accent-foreground))" : "hsl(var(--muted-foreground))"};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $active }) =>
      $active ? "hsl(var(--accent))" : "hsl(var(--muted))"};
    color: ${({ $active }) =>
      $active ? "hsl(var(--accent-foreground))" : "hsl(var(--foreground))"};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: hsl(var(--border));
  margin: 0 8px;
`;

const PlayButton = styled(IconButton)`
  width: 36px;
  height: 36px;
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));

  &:hover {
    background: hsl(var(--accent) / 0.9);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const CloseButton = styled(IconButton)`
  &:hover {
    background: hsl(var(--destructive) / 0.1);
    color: hsl(var(--destructive));
  }
`;

/** 视图模式图标映射 */
const VIEW_MODE_ICONS: Record<MusicViewMode, React.ReactNode> = {
  lyrics: <FileText />,
  numbered: <Music />,
  guitar: <Guitar />,
  piano: <Piano />,
};

/**
 * 音乐画布工具栏
 */
export const MusicToolbar: React.FC<MusicToolbarProps> = memo(
  ({
    spec,
    viewMode,
    isPlaying,
    canUndo,
    canRedo,
    onViewModeChange,
    onPlayToggle,
    onUndo,
    onRedo,
    onExport,
    onClose,
  }) => {
    const viewModes: MusicViewMode[] = [
      "lyrics",
      "numbered",
      "guitar",
      "piano",
    ];

    return (
      <ToolbarContainer>
        <LeftSection>
          <ThemeLabel>音乐</ThemeLabel>
          <SongTitle>{spec.title}</SongTitle>
          <SongMeta>
            {spec.key} | {spec.tempo} BPM
          </SongMeta>
        </LeftSection>

        <CenterSection>
          {viewModes.map((mode) => (
            <ViewModeButton
              key={mode}
              $active={viewMode === mode}
              onClick={() => onViewModeChange(mode)}
              title={VIEW_MODE_LABELS[mode]}
            >
              {VIEW_MODE_ICONS[mode]}
              {VIEW_MODE_LABELS[mode]}
            </ViewModeButton>
          ))}
        </CenterSection>

        <RightSection>
          <PlayButton
            onClick={onPlayToggle}
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? <Pause /> : <Play />}
          </PlayButton>

          <Divider />

          <IconButton onClick={onUndo} disabled={!canUndo} title="撤销">
            <Undo2 />
          </IconButton>

          <IconButton onClick={onRedo} disabled={!canRedo} title="重做">
            <Redo2 />
          </IconButton>

          <Divider />

          <IconButton onClick={onExport} title="导出">
            <Download />
          </IconButton>

          <CloseButton onClick={onClose} title="关闭">
            <X />
          </CloseButton>
        </RightSection>
      </ToolbarContainer>
    );
  },
);

MusicToolbar.displayName = "MusicToolbar";
