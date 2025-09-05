import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface ControlsConfig {
  enableDamping?: boolean;
  dampingFactor?: number;
  minDistance?: number;
  maxDistance?: number;
  maxPolarAngle?: number;
  target?: THREE.Vector3;
}

/**
 * 創建和設置OrbitControls
 */
export function createControls(
  camera: THREE.Camera,
  domElement: HTMLElement,
  config: ControlsConfig = {}
): OrbitControls {
  const controls = new OrbitControls(camera, domElement);

  controls.enableDamping = config.enableDamping !== undefined ? config.enableDamping : true;
  controls.dampingFactor = config.dampingFactor || 0.05;
  controls.minDistance = config.minDistance || 5;
  controls.maxDistance = config.maxDistance || 15;
  controls.maxPolarAngle = config.maxPolarAngle || Math.PI / 1.5;

  if (config.target) {
    controls.target.copy(config.target);
  } else {
    controls.target.set(0, -0.5, 0);
  }

  return controls;
}

/**
 * 設置自動旋轉控制
 */
export function setupAutoRotation(
  container: HTMLElement,
  modelGroup: THREE.Group
): {
  autoRotate: { value: boolean };
  isPaused: { value: boolean };
  rotationSpeed: number;
  update: () => void;
} {
  const autoRotateState = { value: true };
  const isPausedState = { value: false }; // 用於外部控制的暫停狀態
  const rotationSpeed = 0.003; // 降低旋轉速度，原值為 0.005
  let userInteracting = false;
  let interactionTimeout: number | undefined;

  const handleInteractionStart = () => {
    userInteracting = true;
    autoRotateState.value = false;
    clearTimeout(interactionTimeout);
  };

  const handleInteractionEnd = () => {
    userInteracting = false;
    // 如果不是被外部強制暫停，則在延遲後恢復旋轉
    if (!isPausedState.value) {
      interactionTimeout = window.setTimeout(() => {
        autoRotateState.value = true;
      }, 2000); // 2秒後恢復
    }
  };

  container.addEventListener('mousedown', handleInteractionStart);
  container.addEventListener('touchstart', handleInteractionStart);

  container.addEventListener('mouseup', handleInteractionEnd);
  container.addEventListener('touchend', handleInteractionEnd);
  container.addEventListener('mouseleave', handleInteractionEnd);

  const update = () => {
    // 只有在 autoRotate 為 true、用戶沒有交互且沒有被外部暫停時才旋轉
    if (autoRotateState.value && !userInteracting && !isPausedState.value) {
      modelGroup.rotation.y += rotationSpeed;
    }
  };

  return {
    autoRotate: autoRotateState,
    isPaused: isPausedState,
    rotationSpeed,
    update,
  };
}
