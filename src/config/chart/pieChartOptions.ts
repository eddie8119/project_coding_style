import type { EChartsOption } from 'echarts';
import type { PieSeriesOption } from 'echarts/charts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { formatNumberWithCommas } from '@/utils/number';
import { getClassColor } from '@/utils/style/getClassColor';

type PieSeriesDatum = { name: string; value: number };

interface PieChartOptionParams {
  title: string;
  legendData: string[];
  seriesData: PieSeriesDatum[];
  colors?: string[];
  showLegend?: boolean;
  legendPosition?: 'left' | 'bottom';
}

const PIE_CHART_BASE_COLORS = [
  '#1D4ED8',
  '#2563EB',
  '#3B82F6',
  '#60A5FA',
  '#93C5FD',
  '#A5B4FC',
  '#7C3AED',
  '#C084FC',
];

const buildBasePieChartOptions = (): EChartsOption => {
  const textPrimary = getClassColor('text-color-difference', '#111827');
  const textSecondary = getClassColor('text200-color-difference', '#4b5563');
  const formatValue = (value: string | number | undefined) => {
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
    const formatted = formatNumberWithCommas(numericValue);
    return formatted || '0';
  };

  return {
    backgroundColor: 'transparent',
    title: {
      text: '',
      left: 'center',
      top: 12,
      textStyle: {
        color: textPrimary,
        fontSize: 20,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
        const datum = Array.isArray(params) ? params[0] : params;
        const { name = '', value, percent } = datum;
        const formattedValue = formatValue(value as number | string | undefined);
        const formattedPercent =
          typeof percent === 'number' ? `${percent.toFixed(2)}%` : `${percent ?? 0}%`;
        return `${name}: ${formattedValue} (${formattedPercent})`;
      },
      textStyle: {
        fontSize: 14,
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        color: textSecondary,
        fontSize: 14,
      },
      icon: 'circle',
      data: [] as string[],
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: ['0%', '72%'],
        center: ['55%', '55%'],
        data: [] as PieSeriesDatum[],
        label: {
          color: textPrimary,
          fontSize: 12,
          formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
            const datum = Array.isArray(params) ? params[0] : params;
            const { name = '', percent } = datum;
            const formattedPercent =
              typeof percent === 'number' ? `${percent.toFixed(1)}%` : `${percent ?? 0}%`;
            return `${name}: ${formattedPercent}`;
          },
        },
        labelLine: {
          lineStyle: {
            color: 'rgba(55, 65, 81, 0.4)',
          },
          smooth: 0.2,
          length: 12,
          length2: 20,
        },
        itemStyle: {
          borderRadius: 6,
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.15)',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 18,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.35)',
          },
        },
      },
    ],
  };
};

export const createPieChartOptions = ({
  legendData,
  seriesData,
  colors,
  showLegend = true,
  legendPosition = 'left',
}: PieChartOptionParams): EChartsOption => {
  const basePieChartOptions = buildBasePieChartOptions();
  const baseSeries = (
    Array.isArray(basePieChartOptions.series)
      ? basePieChartOptions.series[0]
      : basePieChartOptions.series
  ) as PieSeriesOption | undefined;
  const resolvedColors = colors ?? generatePieChartColors(seriesData.length);
  const isBottomLegend = legendPosition === 'bottom';
  const resolvedCenter: PieSeriesOption['center'] = showLegend
    ? isBottomLegend
      ? ['50%', '45%']
      : ['55%', '55%']
    : ['50%', '55%'];
  const resolvedLegend = showLegend
    ? {
        ...(basePieChartOptions.legend ?? {}),
        orient: isBottomLegend ? 'horizontal' : 'vertical',
        left: isBottomLegend ? 'center' : 'left',
        top: isBottomLegend ? undefined : 'middle',
        bottom: isBottomLegend ? 0 : undefined,
        data: legendData,
      }
    : undefined;

  return {
    ...basePieChartOptions,
    color: resolvedColors,
    legend: resolvedLegend,
    series: [
      {
        ...(baseSeries ?? {}),
        data: seriesData,
        center: resolvedCenter,
      },
    ],
  } as EChartsOption;
};

export const generatePieChartColors = (count: number): string[] => {
  if (count <= 0) return [];

  const colors: string[] = [];
  for (let i = 0; i < count; i += 1) {
    if (i < PIE_CHART_BASE_COLORS.length) {
      colors.push(PIE_CHART_BASE_COLORS[i]);
    } else {
      const hue = (220 + (i - PIE_CHART_BASE_COLORS.length) * 20) % 360;
      const saturation = 65 - ((i * 3) % 10);
      const lightness = 50 + ((i * 5) % 10);
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
  }

  return colors;
};
