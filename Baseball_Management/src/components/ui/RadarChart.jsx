import ReactECharts from 'echarts-for-react';

export default function RadarChart({ stats, title }) {
  const indicators = stats.map((s) => ({
    name: s.label,
    max: s.max || 1,
  }));

  const values = stats.map((s) => s.value);

  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: { color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 },
    },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      axisName: { color: 'var(--text-muted)', fontSize: 11 },
      splitArea: { areaStyle: { color: ['rgba(245,158,11,0.02)', 'rgba(245,158,11,0.05)'] } },
      splitLine: { lineStyle: { color: 'var(--border-subtle)' } },
      axisLine: { lineStyle: { color: 'var(--border-subtle)' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: values,
            areaStyle: { color: 'rgba(245,158,11,0.15)' },
            lineStyle: { color: '#f59e0b', width: 2 },
            itemStyle: { color: '#f59e0b' },
          },
        ],
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 280, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}
