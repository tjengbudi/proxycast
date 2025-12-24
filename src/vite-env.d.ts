/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// 全局类型声明
declare global {
  type NotificationPermission = "default" | "denied" | "granted";

  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export {};
