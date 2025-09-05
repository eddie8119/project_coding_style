import * as THREE from 'three';

/**
 * 設置場景的所有光源
 */
export function setupLighting(scene: THREE.Scene): void {
  // 主光源
  const mainLight = createMainLight();
  scene.add(mainLight);

  // 環境光
  const ambientLight = createAmbientLight();
  scene.add(ambientLight);

  // 後方光源
  const backLight = createBackLight();
  scene.add(backLight);

  // 上方光源
  const topLight = createTopLight();
  scene.add(topLight);
}

/**
 * 創建主光源
 */
function createMainLight(): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(5, 5, 5);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  return light;
}

/**
 * 創建環境光
 */
function createAmbientLight(): THREE.AmbientLight {
  return new THREE.AmbientLight(0xffffff, 0.8);
}

/**
 * 創建後方光源
 */
function createBackLight(): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(-5, 5, -5);
  return light;
}

/**
 * 創建上方光源
 */
function createTopLight(): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(0, 10, 0);
  light.castShadow = true;
  return light;
}
