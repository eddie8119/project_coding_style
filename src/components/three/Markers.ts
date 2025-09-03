import * as THREE from 'three';

import type { ObservationType } from '@/types/device';

import { DeviceStatus } from '@/types/device';

export interface Marker {
  position: { x: number; y: number; z: number };
  type: DeviceStatus;
  observation: ObservationType;
  label: string;
  color: string;
}

/**
 * 創建標記點
 */
export function createMarker(
  position: { x: number; y: number; z: number },
  label: string,
  options: {
    color?: string;
    size?: number;
    type?: 'floating' | 'fixed';
    showLabel?: boolean;
  } = {}
): THREE.Group {
  // 創建一個組來包含標記點和標籤
  const markerGroup = new THREE.Group();

  // 創建球體
  const geometry = new THREE.SphereGeometry(options.size || 0.1, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: options.color || 0xff0000 });
  const sphere = new THREE.Mesh(geometry, material);
  markerGroup.add(sphere);

  // 如果需要顯示標籤
  if (options.showLabel !== false) {
    // 創建標籤
    const labelSprite = createLabelSprite(label, options.color || '#ff0000');
    if (labelSprite) {
      labelSprite.position.y = 0.3; // 位置在球體上方
      markerGroup.add(labelSprite);
    }
  }

  // 設置位置
  markerGroup.position.set(position.x, position.y, position.z);

  return markerGroup;
}

/**
 * 創建標籤精靈
 */
function createLabelSprite(label: string, color: string = '#ff0000'): THREE.Sprite | null {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    console.error('無法獲取 canvas 2d context');
    return null;
  }

  canvas.width = 64;
  canvas.height = 64;

  // 背景圓
  context.beginPath();
  context.arc(32, 32, 30, 0, 2 * Math.PI);
  context.fillStyle = 'white';
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = color;
  context.stroke();

  // 文字
  // 根據標籤長度調整字體大小
  const fontSize = label.length > 3 ? 16 : 20; // 如果標籤超過3個字符，使用較小的字體
  context.font = `bold ${fontSize}px Arial`;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, 32, 32);

  // 從canvas創建精靈
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(1.2, 1.2, 1); // 白色標籤區域尺寸

  return sprite;
}

/**
 * 添加多個標記點到場景
 */
export function addMarkers(scene: THREE.Scene, markers: Marker[]): THREE.Group[] {
  const markerGroups: THREE.Group[] = [];

  markers.forEach((marker) => {
    const markerMesh = createMarker(marker.position, marker.label, {
      color: marker.color,
    });
    scene.add(markerMesh);
    markerGroups.push(markerMesh);
  });

  return markerGroups;
}

/**
 * 創建固定在模型上的標記點
 */
export function createFixedMarker(
  modelGroup: THREE.Group,
  position: { x: number; y: number; z: number },
  label: string,
  options: {
    color?: string;
    size?: number;
    showLabel?: boolean;
  } = {}
): THREE.Group {
  // 創建標記
  const markerGroup = createMarker(position, label, {
    color: options.color || '#ff0000',
    size: options.size || 0.05,
    type: 'fixed',
    showLabel: options.showLabel,
  });

  // 將標記添加到模型組，這樣它會跟隨模型移動
  modelGroup.add(markerGroup);

  return markerGroup;
}

/**
 * 添加多個固定標記點到模型
 */
export function addFixedMarkers(modelGroup: THREE.Group, markers: Marker[]): THREE.Group[] {
  const markerGroups: THREE.Group[] = [];

  markers.forEach((marker) => {
    const markerMesh = createFixedMarker(modelGroup, marker.position, marker.label, {
      color: marker.color,
    });
    markerGroups.push(markerMesh);
  });

  return markerGroups;
}

/**
 * 更新標記精靈方向，使其始終面向相機
 */
export function updateMarkerOrientations(markerGroups: THREE.Group[], camera: THREE.Camera): void {
  markerGroups.forEach((markerGroup) => {
    if (markerGroup.children && markerGroup.children.length > 1) {
      const sprite = markerGroup.children[1];
      if (sprite instanceof THREE.Sprite) {
        sprite.lookAt(camera.position);
      }
    }
  });
}
