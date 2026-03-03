<template>
  <div class="flex flex-col md:h-[calc(100vh-108px)]">
    <!-- 頁面標題 -->
    <div class="flex flex-col">
      <H1Title :title="t('title.project_collaborator_management')" />
      <p class="text-color-difference">
        {{ t('description.project_collaborator_management') }}
      </p>
    </div>

    <section class="flex-1 overflow-y-auto p-4">
      <ProjectCollaboratorContent />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import H1Title from '@/components/core/title/H1Title.vue';
import ProjectCollaboratorContent from '@/components/setting/ProjectCollaboratorContent.vue';

const { t } = useI18n();
</script>

<style scoped></style>
