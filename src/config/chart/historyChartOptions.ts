import type { EChartsOption } from 'echarts';

interface ChartData {
  timeData: (string | null)[];
  unitData: (number | null)[];
  yMin: number;
  yMax: number;
  markAreaData: [{ name: string; xAxis: string }, { xAxis: string }][];
}

export function createHistoryChartOption(chartData: ChartData, unit: string): EChartsOption {
  const { timeData, unitData, yMin, yMax, markAreaData } = chartData;

  const baseOption: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { animation: false },
    },
    toolbox: {
      feature: {
        dataZoom: { show: false },
        restore: { title: 'Enable chart zooming' },
        saveAsImage: {},
      },
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
    },
  };

  return {
    ...baseOption,
    legend: {
      data: [unit],
      left: 10,
    },
    dataZoom: [
      { show: true, realtime: true, start: 0, end: 100, xAxisIndex: 0 },
      { type: 'inside', realtime: true, start: 0, end: 100, xAxisIndex: 0 },
    ],
    grid: {
      left: 60,
      right: 50,
      bottom: 80,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: { onZero: true },
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 12,
          formatter: function (value: string, index: number) {
            const total = timeData.length;
            const showEvery = Math.ceil(total / 15);
            if (index % showEvery === 0) {
              return value;
            }
            return '';
          },
        },
        data: timeData.map((item) => item ?? ''),
      },
    ],
    yAxis: [
      {
        name: unit,
        type: 'value',
        max: yMax,
        min: yMin,
      },
    ],
    series: [
      {
        name: unit,
        type: 'line',
        symbol: 'none',
        data: unitData,
        lineStyle: {
          width: 1,
          color: '#0050be',
        },
        itemStyle: {
          color: '#0050be',
        },
        markPoint: {
          data: [
            { type: 'max', name: '最高點', itemStyle: { color: '#0050be' } },
            {
              type: 'min',
              name: '最低點',
              itemStyle: { color: '#0050be' },
              symbolRotate: 180,
            },
          ],
        },
        markLine: {
          data: [
            { type: 'max', name: '最高點', itemStyle: { color: '5dd65c' } },
            {
              type: 'min',
              name: '最低點',
              itemStyle: { color: '#0050be' },
              symbolRotate: 180,
            },
          ],
        },
        markArea: {
          itemStyle: {
            color: 'rgba(200, 200, 200, 0.7)', // Light gray, semi-transparent
          },
          label: {
            show: false,
          },
          data: markAreaData,
        },
      },
    ],
  };
}
