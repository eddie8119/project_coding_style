<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="shadow-sm">
      <div class="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <H1Title :title="fetchedSharedProject?.title || '專案標題'" />
          <div class="text-sm text-gray-500">唯讀模式</div>
        </div>
      </div>
    </header>

    <div v-if="isLoadingSharedProject" class="flex min-h-screen items-center justify-center">
      <Loading />
    </div>

    <!-- Error State -->
    <div v-else-if="sharedProjectError" class="mx-auto max-w-[1600px] px-4 py-12 sm:px-4">
      <div class="rounded-lg bg-red-50 p-6 text-center">
        <p class="text-secondary-red">
          {{ sharedProjectError.message || '此專案不存在或未公開分享' }}
        </p>
      </div>
    </div>

    <div v-else-if="fetchedSharedProject" class="mx-auto max-w-[1600px] px-4 py-8 sm:px-4">
      <KanbanBoard
        :construction-container="fetchedSharedProject.constructionContainer"
        :project-id="fetchedSharedProject.id"
        :tasks="fetchedSharedProject.tasks || []"
        :read-only="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

import Loading from '@/components/core/loading/Loading.vue';
import H1Title from '@/components/core/title/H1Title.vue';
import KanbanBoard from '@/components/project/KanbanBoard.vue';
import { useProjectShare } from '@/composables/query/useProjectShare';

const route = useRoute();
const projectId = route.params.id as string;

const { isLoadingSharedProject, sharedProjectError, fetchedSharedProject } =
  useProjectShare(projectId);
</script>
