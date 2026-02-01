/**
 * @file Artifact 操作 Hook
 * @description 封装 Artifact 状态读取和操作的 React Hook
 * @module lib/artifact/hooks/useArtifact
 * @requirements 9.4
 */

import { useAtomValue, useSetAtom } from "jotai";
import type { Artifact } from "../types";
import {
  artifactsAtom,
  selectedArtifactAtom,
  artifactActionsAtom,
} from "../store";

/**
 * Artifact 操作 Hook
 *
 * 提供对 Artifact 状态的读取和操作封装：
 * - artifacts: 当前所有 Artifact 列表
 * - selectedArtifact: 当前选中的 Artifact
 * - addArtifact: 添加新 Artifact
 * - updateArtifact: 更新指定 Artifact
 * - removeArtifact: 删除指定 Artifact
 * - selectArtifact: 选中指定 Artifact
 * - clearArtifacts: 清空所有 Artifact
 *
 * @returns Artifact 状态和操作方法
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     artifacts,
 *     selectedArtifact,
 *     addArtifact,
 *     selectArtifact,
 *   } = useArtifact();
 *
 *   const handleAdd = () => {
 *     addArtifact({
 *       id: 'unique-id',
 *       type: 'code',
 *       title: 'Example',
 *       content: 'console.log("hello")',
 *       status: 'complete',
 *       meta: { language: 'javascript' },
 *       position: { start: 0, end: 100 },
 *       createdAt: Date.now(),
 *       updatedAt: Date.now(),
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleAdd}>Add Artifact</button>
 *       <ul>
 *         {artifacts.map(a => (
 *           <li key={a.id} onClick={() => selectArtifact(a.id)}>
 *             {a.title}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 *
 * @requirements 9.4
 */
export function useArtifact() {
  // 读取状态
  const artifacts = useAtomValue(artifactsAtom);
  const selectedArtifact = useAtomValue(selectedArtifactAtom);

  // 获取 dispatch 函数
  const dispatch = useSetAtom(artifactActionsAtom);

  return {
    /** 当前所有 Artifact 列表 */
    artifacts,

    /** 当前选中的 Artifact，未选中时为 null */
    selectedArtifact,

    /**
     * 添加新 Artifact
     * 如果已存在相同 ID 的 Artifact，则更新它
     * @param artifact - 要添加的 Artifact 对象
     */
    addArtifact: (artifact: Artifact) => dispatch({ type: "add", artifact }),

    /**
     * 更新指定 Artifact
     * @param id - Artifact ID
     * @param updates - 要更新的字段（不包括 id）
     */
    updateArtifact: (id: string, updates: Partial<Omit<Artifact, "id">>) =>
      dispatch({ type: "update", id, updates }),

    /**
     * 删除指定 Artifact
     * 如果删除的是当前选中的 Artifact，会自动清除选中状态
     * @param id - 要删除的 Artifact ID
     */
    removeArtifact: (id: string) => dispatch({ type: "remove", id }),

    /**
     * 选中指定 Artifact
     * @param id - 要选中的 Artifact ID，传 null 清除选中
     */
    selectArtifact: (id: string | null) => dispatch({ type: "select", id }),

    /**
     * 清空所有 Artifact
     * 同时清除选中状态和流式状态
     */
    clearArtifacts: () => dispatch({ type: "clear" }),
  };
}
