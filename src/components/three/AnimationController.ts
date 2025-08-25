import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { updateMarkerOrientations } from './Markers';

// 用於追蹤所有活動的動畫控制器
const activeControllers = new Set<ReturnType<typeof createAnimationController>>();

// 全局清理函數 - 可在路由變更或應用關閉時調用
export function cleanupAllAnimations(): void {
  activeControllers.forEach((controller) => {
    controller.stop();
  });
  activeControllers.clear();
}

export interface AnimationConfig {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  autoRotationController?: {
    autoRotate: { value: boolean };
    update: () => void;
  };
  markerGroups?: THREE.Group[];
}

/**
 * 創建動畫控制器
 *
 * 用法：
 * const controller = createAnimationController(config);
 * controller.start(); // 啟動動畫循環
 * controller.stop();  // 停止動畫循環（組件卸載時務必調用）
 * if (controller.isRunning) { ... }
 *
 * 注意：
 * 1. 必須在組件的 onBeforeUnmount 或 unmounted 生命週期中調用 stop() 方法
 * 2. 或者在路由變更時調用 cleanupAllAnimations() 全局清理函數
 */
export function createAnimationController(config: AnimationConfig) {
  let animationFrameId: number | null = null;
  let active = false;
  let destroyed = false;

  // 創建控制器實例
  const controller = {
    start() {
      if (active || destroyed) return;
      active = true;
      requestAnimationFrame(animate);
      activeControllers.add(controller);
    },

    stop() {
      active = false;
      destroyed = true;

      if (animationFrameId !== null) {
        // 確保取消當前的動畫幀
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      // 從活動控制器集合中移除
      activeControllers.delete(controller);
    },

    get isRunning() {
      return active;
    },

    get isDestroyed() {
      return destroyed;
    },
  };

  // 動畫循環函數 - 使用函數聲明以避免this綁定問題
  function animate() {
    // 如果已停止或已銷毀，不繼續執行
    if (!active || destroyed) return;

    // 請求下一幀之前先存儲ID
    animationFrameId = window.requestAnimationFrame(animate);

    try {
      // 自動旋轉更新
      if (config.autoRotationController) {
        config.autoRotationController.update();
      }

      // 更新標記方向
      if (config.markerGroups && config.markerGroups.length > 0) {
        updateMarkerOrientations(config.markerGroups, config.camera);
      }

      // 更新控制器
      config.controls.update();

      // 渲染場景
      config.renderer.render(config.scene, config.camera);
    } catch (error) {
      console.error('Animation loop error:', error);
      // 發生錯誤時停止動畫
      controller.stop();
    }
  }

  return controller;
}
