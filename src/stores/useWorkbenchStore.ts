/**
 * @file useWorkbenchStore.ts
 * @description Workbench 页面的 Zustand 状态管理 Store
 * @module stores/useWorkbenchStore
 *
 * 管理 Workbench 页面的 UI 状态，包括侧边栏折叠状态
 * 使用 persist 中间件持久化到 localStorage
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Workbench Store 状态接口
 */
export interface WorkbenchState {
  /** 左侧栏是否折叠 */
  leftSidebarCollapsed: boolean;

  /** 切换左侧栏折叠状态 */
  toggleLeftSidebar: () => void;

  /** 设置左侧栏折叠状态 */
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
}

/**
 * 初始状态
 */
const initialState = {
  leftSidebarCollapsed: true, // 默认折叠，给画布更多空间
};

/**
 * Workbench Zustand Store
 *
 * 使用 persist 中间件持久化 UI 状态到 localStorage
 */
export const useWorkbenchStore = create<WorkbenchState>()(
  persist(
    (set) => ({
      ...initialState,

      toggleLeftSidebar: () => {
        set((state) => ({
          leftSidebarCollapsed: !state.leftSidebarCollapsed,
        }));
      },

      setLeftSidebarCollapsed: (collapsed: boolean) => {
        set({ leftSidebarCollapsed: collapsed });
      },
    }),
    {
      name: "workbench-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
