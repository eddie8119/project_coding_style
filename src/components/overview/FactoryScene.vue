<template>
  <div class="relative h-full w-full">
    <div v-if="isLoading" class="h-full w-full">
      <Loading />
    </div>

    <div ref="sceneContainer" class="h-full w-full" />
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { computed, onActivated, onDeactivated, ref, watch } from 'vue';

import Loading from '@/components/core/loading/Loading.vue';
import { positionLists } from '@/constants/dummyData';
import { ObservationType } from '@/types/device';
import { DeviceStatus } from '@/types/device';
import { createAnimationController } from '@/utils/three/AnimationController';
import { createControls, setupAutoRotation } from '@/utils/three/Controls';
import { setupLighting } from '@/utils/three/Lighting';
import { addFixedMarkers } from '@/utils/three/Markers';
import { loadModel } from '@/utils/three/ModelLoader';
import {
  CameraViewType,
  createCamera,
  createRenderer,
  createScene,
  handleResize,
  setCameraPosition,
} from '@/utils/three/SceneSetup';

const props = defineProps<{
  monitoringItems: {
    label: string;
    type: DeviceStatus;
    observation: ObservationType;
  }[];
  observationChoose: ObservationType | undefined;
}>();

// 場景容器參考
const sceneContainer = ref<HTMLElement | null>(null);
const isLoading = ref(true);

// 定義動畫控制器
let animationController: ReturnType<typeof createAnimationController> | null = null;

const markerColorByType = (type: DeviceStatus) => {
  if (type === DeviceStatus.CAUTION) return '#0050be';
  return '#ff0000'; // 預設紅色
};

// 將提取出的 tags 與 positionLists 進行映射
const tagPositionList = computed(() => {
  return props.monitoringItems.map((item, idx) => ({
    ...item,
    position: positionLists[idx]?.position || null,
    color: markerColorByType(item.type),
  }));
});

const filteredMarkers = computed(() => {
  if (!props.observationChoose) {
    return tagPositionList.value;
  }
  return tagPositionList.value.filter((marker) => marker.observation === props.observationChoose);
});

// 清理函數
let cleanup: (() => void) | null = null;

// 保存相機和控制器的引用，以便在 watch 中使用
let cameraRef: THREE.PerspectiveCamera | null = null;
let controlsRef: OrbitControls | null = null;

// 初始化場景
const initScene = async () => {
  if (!sceneContainer.value) return;
  isLoading.value = true;

  // 清理舊的渲染器（如果存在）
  while (sceneContainer.value.firstChild) {
    sceneContainer.value.removeChild(sceneContainer.value.firstChild);
  }

  // 初始化Three.js場景
  const scene = createScene({ backgroundColor: 0xf5f5f5 });
  const camera = createCamera(sceneContainer.value);
  cameraRef = camera; // 保存相機引用
  const renderer = createRenderer(sceneContainer.value, {
    antialias: true,
    shadowMapEnabled: true,
    shadowMapType: THREE.PCFSoftShadowMap,
  });

  // 設置光源
  setupLighting(scene);

  // 創建模型組
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  // 設置控制器
  const controls = createControls(camera, renderer.domElement, {
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 5,
    maxDistance: 15,
    maxPolarAngle: Math.PI / 1.5,
    target: new THREE.Vector3(0, -0.5, 0),
  });
  controlsRef = controls; // 保存控制器引用

  // 設置自動旋轉
  const autoRotationController = setupAutoRotation(sceneContainer.value, modelGroup);

  // 處理視窗大小變化
  const resizeCleanup = handleResize(sceneContainer.value, camera, renderer);

  // 加載模型
  loadModel(
    {
      path: '/models/SITE.glb',
      scale: 1.0,
      yOffset: 0.8,
      enableShadows: true,
    },
    modelGroup,
    controls,
    () => {
      isLoading.value = false;
      // 添加固定在模型上的標記點
      let fixedMarkerGroups = addFixedMarkers(modelGroup, filteredMarkers.value);

      // 合併所有標記組以便更新方向
      const allMarkerGroups = [...fixedMarkerGroups];

      // 監聽 observationChoose 變化，更新標記點和相機視角
      watch(
        () => props.observationChoose,
        (newValue, oldValue) => {
          // 移除現有的標記點
          fixedMarkerGroups.forEach((group) => {
            modelGroup.remove(group);
          });

          // 添加新的過濾後的標記點
          fixedMarkerGroups = addFixedMarkers(modelGroup, filteredMarkers.value);

          // 更新合併的標記組
          allMarkerGroups.splice(0, allMarkerGroups.length, ...fixedMarkerGroups);

          // 當選擇特定觀察類型時，切換到俯視視角並暫停旋轉
          if (cameraRef && controlsRef) {
            if (newValue && newValue !== undefined && newValue !== oldValue) {
              // 切換到俯視視角
              setCameraPosition(cameraRef, CameraViewType.TOP_VIEW, controlsRef, modelGroup);
              // 暫停旋轉
              if (autoRotationController) {
                autoRotationController.isPaused.value = true; // 強制暫停
              }
            } else if (!newValue && newValue !== oldValue) {
              // 切換回默認視角
              setCameraPosition(cameraRef, CameraViewType.DEFAULT, controlsRef, modelGroup);
              // 恢復旋轉
              if (autoRotationController) {
                autoRotationController.isPaused.value = false; // 取消強制暫停
              }
            }
          }
        }
      );

      // 初始設置相機位置
      if (
        props.observationChoose &&
        props.observationChoose !== undefined &&
        cameraRef &&
        controlsRef
      ) {
        setCameraPosition(cameraRef, CameraViewType.TOP_VIEW, controlsRef, modelGroup);
      }

      // 創建動畫控制器
      animationController = createAnimationController({
        scene,
        camera,
        renderer,
        controls,
        autoRotationController,
        markerGroups: allMarkerGroups, // 使用合併後的標記組
      });

      // 啟動動畫
      animationController.start();

      // 設置清理函數
      cleanup = () => {
        if (animationController) animationController.stop();
        resizeCleanup();
        renderer.dispose();
        // 其他清理工作...
      };
    }
  );
};

const cleanupScene = () => {
  if (cleanup) {
    cleanup();
  }
  cleanup = null;
  animationController = null;
};

onActivated(() => {
  initScene();
});

onDeactivated(() => {
  cleanupScene();
});
</script>

<style scoped></style>
