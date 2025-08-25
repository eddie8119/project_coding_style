<template>
  <div class="rounded-lg bg-white p-4 shadow-lg">
    <h3 class="mb-3 text-lg font-semibold">{{ title }}</h3>
    <table class="min-w-full">
      <thead class="border-b">
        <tr>
          <th class="py-2 text-left text-sm font-medium text-gray-500">設備ID</th>
          <th class="py-2 text-left text-sm font-medium text-gray-500">數值</th>
          <th class="py-2 text-left text-sm font-medium text-gray-500">狀態</th>
        </tr>
      </thead>
      <tbody class="divide-y">
        <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
          <td class="py-2 text-sm">{{ item.deviceId }}</td>
          <td class="py-2 text-sm">{{ item.value }}{{ unit }}</td>
          <td class="py-2">
            <span
              :class="{
                'rounded-full px-2 py-1 text-xs font-medium': true,
                'bg-green-100 text-green-700': item.status === 'normal',
                'bg-yellow-100 text-yellow-700': item.status === 'warning',
                'bg-red-100 text-red-700': item.status === 'error',
              }"
            >
              {{ getStatusText(item.status) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface MonitoringItem {
  id: string;
  deviceId: string;
  value: number;
  status: 'normal' | 'warning' | 'error';
}

defineProps<{
  title: string;
  unit: string;
  items: MonitoringItem[];
}>();

const getStatusText = (status: string) => {
  const statusMap = {
    normal: '正常',
    warning: '警告',
    error: '異常',
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

// const flowItems = ref([
//   { id: '1', deviceId: 'FLOW-001', value: 45.2, status: 'normal' },
//   { id: '2', deviceId: 'FLOW-002', value: 38.7, status: 'warning' },
//   { id: '3', deviceId: 'FLOW-003', value: 42.1, status: 'normal' },
// ]);
</script>
