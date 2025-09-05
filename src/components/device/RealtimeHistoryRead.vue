<template>
  <div class="panel-container">
    <div class="mb-2 flex items-center justify-between">
      <H3Title title="Realtime" />
      <!-- <span class="text-xs text-gray-500">3 minutes ago</span> -->
    </div>
    <canvas ref="chartRef" />
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js';
import { onActivated, onDeactivated, ref } from 'vue';

import H3Title from '@/components/core/title/H3Title.vue';

Chart.register(...registerables);

const chartRef = ref<HTMLCanvasElement | null>(null);

const phValues = ref<number[]>([]);
const timeLabels = ref<string[]>([]);
let chartInstance: Chart | null = null;
let dataUpdateInterval: number | undefined = undefined;

const MAX_DATA_POINTS = 30; // Keep a maximum of 30 data points on the chart

const addPhData = () => {
  const now = new Date();
  const newPhValue = Math.random() * (8.5 - 6.5) + 6.5; // Simulate pH between 6.5 and 8.5

  phValues.value.push(parseFloat(newPhValue.toFixed(2)));
  timeLabels.value.push(
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Keep the data arrays from growing indefinitely
  if (phValues.value.length > MAX_DATA_POINTS) {
    phValues.value.shift();
    timeLabels.value.shift();
  }

  if (chartInstance) {
    chartInstance.data.labels = timeLabels.value;
    chartInstance.data.datasets[0].data = phValues.value;
    chartInstance.update();
  }
};

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: timeLabels.value,
      datasets: [
        {
          label: 'pH Value',
          data: phValues.value,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          yAxisID: 'y',
          tension: 0.1, // Add some smoothing to the line
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'bottom', // Show legend
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'pH Value',
          },
          min: 6.0, // Adjusted for typical pH range
          max: 9.0,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  // Initial data point
  addPhData();

  // Start interval to add new data every 10 seconds
  dataUpdateInterval = window.setInterval(addPhData, 10000);
};

onActivated(() => {
  initChart();
});

onDeactivated(() => {
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval);
  }
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped></style>
