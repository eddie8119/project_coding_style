import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * 在模型上添加控制室標記
 * @param modelGroup - 要添加標記的模型組
 * @param position - 控制室的位置，默認為 (2, 0.2, 5)
 * @param color - 標記點的顏色，默認為綠色
 */
export function addControlRoomMarker(
  modelGroup: THREE.Group,
  position: THREE.Vector3 = new THREE.Vector3(-5.5, 0, 5),
  color: number = 0x00ff00
): void {
  // 創建文字標籤
  const labelDiv = document.createElement('div');
  labelDiv.className = 'text-label font-bold';
  labelDiv.textContent = 'here';
  labelDiv.style.color = '#ffffff';
  labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  labelDiv.style.padding = '4px 8px';
  labelDiv.style.borderRadius = '5px';
  labelDiv.style.pointerEvents = 'none'; // 避免遮擋滑鼠事件
  labelDiv.style.fontSize = '14px';
  labelDiv.style.fontWeight = 'bold';
  labelDiv.style.userSelect = 'none'; // 防止文字被選取

  // 創建 CSS2D 標籤對象
  const textLabel = new CSS2DObject(labelDiv);
  textLabel.position.copy(position);
  textLabel.position.y += 0.5; // 將文字標籤稍微向上偏移
  // 確保標籤始終面向相機
  textLabel.layers.enableAll(); // 確保在所有層都可見

  // 創建一個更明顯的點標記 (一個小圓球)
  const geometry = new THREE.SphereGeometry(0.2, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color });
  const pointMarker = new THREE.Mesh(geometry, material);
  pointMarker.position.copy(position);

  // 將標記和文字標籤加到一個群組中
  const controlRoomGroup = new THREE.Group();
  controlRoomGroup.add(pointMarker);
  controlRoomGroup.add(textLabel);

  // 將群組加到主模型組中
  modelGroup.add(controlRoomGroup);
}
