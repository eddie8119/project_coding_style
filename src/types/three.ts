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

export interface ControlsConfig {
  enableDamping?: boolean;
  dampingFactor?: number;
  minDistance?: number;
  maxDistance?: number;
  maxPolarAngle?: number;
  target?: THREE.Vector3;
}
