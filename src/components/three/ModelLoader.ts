import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export interface ModelConfig {
  path: string;
  scale?: number;
  yOffset?: number;
  enableShadows?: boolean;
}

/**
 * 加載3D模型
 */
export function loadModel(
  modelConfig: ModelConfig,
  modelGroup: THREE.Group,
  controls: OrbitControls,
  onLoad?: () => void
): void {
  const loader = new GLTFLoader();

  loader.load(modelConfig.path, (gltf) => {
    const model = gltf.scene;

    // 將模型添加到群組中
    modelGroup.add(model);

    // 計算模型邊界盒以便正確定位
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    // 調整模型位置
    model.position.x = -center.x;
    model.position.y = -center.y + (modelConfig.yOffset || 0.8);
    model.position.z = -center.z;

    // 調整模型縮放
    const scale = modelConfig.scale || 1.0;
    model.scale.set(scale, scale, scale);

    // 設置陰影
    if (modelConfig.enableShadows !== false) {
      model.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
    }

    // 更新控制器
    controls.update();

    // 執行加載完成回調
    if (onLoad) {
      onLoad();
    }
  });
}
