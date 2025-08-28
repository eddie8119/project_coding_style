<template>
  <el-card class="panel-container">
    <template #header>
      <div class="flex items-center">
        <el-avatar :size="50" class="mr-4">
          {{ username?.charAt(0)?.toUpperCase() || 'U' }}
        </el-avatar>
        <H1Title :title="username || 'User Profile'" />
      </div>
    </template>

    <el-skeleton :loading="loading" animated>
      <template #default>
        <div class="profile-info space-y-6">
          <div class="info-section">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Username">
                <div class="flex items-center">
                  <span>{{ username }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="Email">
                <div class="flex items-center">
                  <span>{{ email }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="Member Since">
                {{ formatDate(createdAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { usersApi } from '@/api/users';
import H1Title from '@/components/core/title/H1Title.vue';

const email = ref<string>('');
const username = ref<string>('');
const createdAt = ref<string>('');
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await usersApi.getUserProfile();
    email.value = response.data.email;
    username.value = response.data.username;
    createdAt.value = response.data.created_at || new Date().toISOString();
  } finally {
    loading.value = false;
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>

<style scoped>
.info-section {
  padding: 1.5rem 0;
  border-bottom: 1px solid #eee;
}

.info-section:last-child {
  border-bottom: none;
}
</style>
