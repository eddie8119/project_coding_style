import * as THREE from 'three';

export interface SceneConfig {
  backgroundColor?: number;
}

// 相機視角類型
export enum CameraViewType {
  DEFAULT = 'default',
  TOP_VIEW = 'top_view',
  SIDE_VIEW = 'side_view',
}

export interface RendererConfig {
  antialias?: boolean;
  shadowMapEnabled?: boolean;
  shadowMapType?: THREE.ShadowMapType;
}

/**
 * 創建和設置Three.js場景
 */
export function createScene(config: SceneConfig = {}): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.backgroundColor || 0xf5f5f5);
  return scene;
}

/**
 * 創建和設置Three.js相機
 */
export function createCamera(container: HTMLElement): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    70,
    container.clientWidth / container.clientHeight,
    0.2,
    1000
  );
  camera.position.set(8, 8, 8);
  camera.lookAt(0, 0, 0);
  return camera;
}

/**
 * 創建和設置Three.js渲染器
 */
export function createRenderer(
  container: HTMLElement,
  config: RendererConfig = {}
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: config.antialias !== undefined ? config.antialias : true,
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled =
    config.shadowMapEnabled !== undefined ? config.shadowMapEnabled : true;
  renderer.shadowMap.type = config.shadowMapType || THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  return renderer;
}

/**
 * 處理視窗大小變化
 */
export function handleResize(
  container: HTMLElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): () => void {
  const resizeHandler = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };

  window.addEventListener('resize', resizeHandler);

  // 返回清理函數
  return () => window.removeEventListener('resize', resizeHandler);
}

/**
 * 設置相機位置和視角
 * @param camera - Three.js 相機
 * @param viewType - 視角類型
 * @param controls - 可選的控制器，如果提供則會更新控制器目標
 */
export function setCameraPosition(
  camera: THREE.PerspectiveCamera,
  viewType: CameraViewType,
  controls?: any,
  modelGroup?: THREE.Object3D
): void {
  switch (viewType) {
    case CameraViewType.TOP_VIEW:
      // 俯視視角 - 從正上方往下看
      camera.position.set(0, 11, 0);
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
      if (modelGroup) {
        modelGroup.rotation.set(0, 0, 0); // 讓模型正向
      }
      break;

    case CameraViewType.SIDE_VIEW:
      // 側視視角
      camera.position.set(10, 2, 0);
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
      break;

    case CameraViewType.DEFAULT:
    default:
      // 默認視角
      camera.position.set(8, 8, 8);
      if (controls) {
        controls.target.set(0, -0.5, 0);
        controls.update();
      }
      break;
  }

  camera.updateProjectionMatrix();
}
