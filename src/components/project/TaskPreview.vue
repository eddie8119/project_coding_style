<template>
  <div class="task-card">
    <div class="flex justify-between">
      <div class="task-title font-medium">{{ card.title }}</div>
      <div class="flex">
        <button class="edit-btn mr-1" @click="handleEdit">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button class="delete-btn" @click="handleDelete">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
    <div v-if="card.content" class="task-content mt-2 text-sm text-gray-600">
      {{ card.content }}
    </div>
    <div v-if="card.status" class="task-status mt-2">
      <span :class="getStatusClass(card.status)" class="rounded px-2 py-1 text-xs">
        {{ card.status }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TaskCard {
  id: string;
  key: string;
  title: string;
  content?: string;
  status?: string;
}

const props = defineProps<{
  card: TaskCard;
}>();

const emit = defineEmits<{
  (e: 'handleEditCard', card: TaskCard): void;
  (e: 'handleDeleteCard', cardId: string): void;
}>();

const handleEdit = () => {
  emit('handleEditCard', props.card);
};

const handleDelete = () => {
  emit('handleDeleteCard', props.card.id);
};

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case '未完成':
      return 'bg-yellow-100 text-yellow-800';
    case '完成':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script>

<style scoped>
.task-card {
  @apply rounded-md p-3 shadow-sm transition-all duration-200 hover:shadow-md;
}

.edit-btn,
.delete-btn {
  @apply rounded p-1 transition-colors duration-200 hover:bg-gray-100;
}
</style>
