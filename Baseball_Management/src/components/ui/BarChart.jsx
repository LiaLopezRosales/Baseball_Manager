import ReactECharts from 'echarts-for-react';

export default function BarChart({ teams, values, title }) {
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 12, right: 16, top: 28, bottom: 4, containLabel: true },
    title: {
      text: title,
      left: 'center',
      textStyle: { color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 },
    },
    xAxis: {
      type: 'category',
      data: teams,
      axisLabel: { color: 'var(--text-muted)', fontSize: 11, rotate: 20 },
      axisLine: { lineStyle: { color: 'var(--border-subtle)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'var(--text-muted)', fontSize: 11 },
      splitLine: { lineStyle: { color: 'var(--border-subtle)', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: values,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#f59e0b' },
              { offset: 1, color: '#b45309' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barMaxWidth: 36,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 260, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}
