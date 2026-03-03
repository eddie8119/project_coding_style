import type { EChartsOption } from 'echarts';

import { getClassColor } from '@/utils/style/getClassColor';

const formatAxisLabel = (value: string | number): string => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  if (Math.abs(numericValue) >= 1000) {
    const abbreviated = numericValue / 1000;
    const formatted = Math.abs(abbreviated) >= 10 ? abbreviated.toFixed(0) : abbreviated.toFixed(1);
    return `${formatted}k`;
  }

  return numericValue.toLocaleString();
};

export const createBaseHorizontalBarChartOptions = (): EChartsOption => {
  const textPrimary = getClassColor('text-color-difference', '#111827');
  const labelTextColor = getClassColor('text-color-difference', '#111827');

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '18%',
      top: '6%',
      bottom: '6%',
      outerBounds: {
        top: '10%',
        bottom: '3%',
        left: '3%',
        right: '18%',
      },
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLabel: {
        color: textPrimary,
        fontSize: 14,
        hideOverlap: true,
        margin: 14,
        formatter: (value: string | number) => formatAxisLabel(value),
      },
      nameTextStyle: {
        color: textPrimary,
        fontSize: 14,
      },
    },
    yAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        color: textPrimary,
        fontSize: 14,
      },
    },
    series: [
      {
        name: '',
        type: 'bar',
        data: [],
        itemStyle: {
          color: '#1D4ED8',
        },
        label: {
          show: true,
          position: 'right',
          distance: 6,
          color: labelTextColor,
          fontSize: 16,
          fontWeight: 600,
          padding: [0, 4],
          textBorderWidth: 0,
          textBorderColor: 'transparent',
        },
      },
    ],
  };
};
