import { ref, type Ref } from 'vue';

export interface UsePinSelectionOptions {
  imageContainer: Ref<HTMLDivElement | undefined>;
}

export const usePinSelection = ({ imageContainer }: UsePinSelectionOptions) => {
  const isAddingPin = ref(false);
  const selectedTaskIdForPin = ref<string | null>(null);
  const pinPosition = ref({ x: 0, y: 0 });

  const selectTaskForPin = (taskId: string) => {
    selectedTaskIdForPin.value = taskId;
    isAddingPin.value = true;
    if (imageContainer.value) {
      pinPosition.value = {
        x: imageContainer.value.clientWidth / 2,
        y: imageContainer.value.clientHeight / 2,
      };
    }
  };

  const cancelPin = () => {
    isAddingPin.value = false;
    selectedTaskIdForPin.value = null;
  };

  return {
    isAddingPin,
    selectedTaskIdForPin,
    pinPosition,
    selectTaskForPin,
    cancelPin,
  };
};
