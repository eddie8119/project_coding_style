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
              <el-descriptions-item :label="t('label.user.username')">
                <div class="flex items-center">
                  <span>{{ username }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item :label="t('label.user.email')">
                <div class="flex items-center">
                  <span>{{ email }}</span>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script setup lang="ts">
import { onActivated, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { usersApi } from '@/api/users';
import H1Title from '@/components/core/title/H1Title.vue';

const { t } = useI18n();

const email = ref<string>('');
const username = ref<string>('');
const loading = ref(true);

const fetchUserProfile = async () => {
  loading.value = true;
  try {
    const response = await usersApi.getUserProfile();
    email.value = response.data.email;
    username.value = response.data.username;
  } finally {
    loading.value = false;
  }
};

// 在 keep-alive 中，onActivated 在首次掛載時也會執行
// 每次組件被激活時也獲取數據
onActivated(fetchUserProfile);
</script>

<style scoped>
.info-section {
  padding: 1.5rem 0;
  border-bottom: 1px solid #eee;
}
</style>
