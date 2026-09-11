import ReactECharts from 'echarts-for-react';

const readVar = (name, fallback) => {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

export default function RadarChart({ stats, title, compact }) {
  const indicators = stats.map((s) => ({
    name: s.label,
    max: s.max || 1,
  }));

  const values = stats.map((s) => s.value);
  const h = compact ? 160 : 280;
  const amber = readVar('--accent', '#f59e0b');

  const option = {
    radar: {
      indicator: indicators,
      shape: 'polygon',
      axisName: { color: 'var(--text-muted)', fontSize: compact ? 10 : 11 },
      splitArea: { areaStyle: { color: ['rgba(242,169,59,0.03)', 'rgba(242,169,59,0.06)'] } },
      splitLine: { lineStyle: { color: 'var(--border-subtle)' } },
      axisLine: { lineStyle: { color: 'var(--border-subtle)' } },
      radius: compact ? '68%' : '72%',
      center: compact ? ['50%', '50%'] : ['50%', '52%'],
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: values,
            areaStyle: { color: 'rgba(242,169,59,0.16)' },
            lineStyle: { color: amber, width: 2 },
            itemStyle: { color: amber },
          },
        ],
      },
    ],
  };

  return (
    <div className="radar-chart">
      {title && !compact && (
        <h3 className="radar-chart__title">{title}</h3>
      )}
      <ReactECharts
        option={option}
        style={{ height: h - (title && !compact ? 34 : 0), width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}
