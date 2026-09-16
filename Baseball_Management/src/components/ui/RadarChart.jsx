import ReactECharts from 'echarts-for-react';

const readVar = (names, fallback) => {
  if (typeof document === 'undefined') return fallback;
  for (const n of names) {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(n)
      .trim();
    if (v) return v;
  }
  return fallback;
};

/**
 * Radar con dos series opcionales: la principal (stats) y una línea de
 * comparación (baseline, p. ej. "Media LNB").
 */
export default function RadarChart({ stats, baseline, title, compact, accent: accentProp }) {
  const indicators = stats.map((s) => ({
    name: s.label,
    max: s.max || 1,
  }));

  const values = stats.map((s) => s.value);
  const h = compact ? 160 : 300;
  const accent = accentProp || readVar(['--prf-lights', '--accent'], '#f59e0b');
  const baselineColor = readVar(['--prf-clay', '--text-muted'], '#64748b');

  const series = [
    {
      name: 'Valor',
      type: 'radar',
      data: [
        {
          value: values,
          areaStyle: { color: `${accent}33` },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
        },
      ],
    },
  ];

  if (baseline && baseline.length === values.length) {
    series.push({
      name: 'Media LNB',
      type: 'radar',
      data: [
        {
          value: baseline,
          symbol: 'none',
          lineStyle: { color: baselineColor, width: 1, type: 'dashed' },
          areaStyle: { opacity: 0 },
          itemStyle: { color: baselineColor },
        },
      ],
    });
  }

  const option = {
    legend: baseline
      ? {
          data: ['Valor', 'Media LNB'],
          bottom: 0,
          icon: 'roundRect',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: { color: 'var(--text-muted)', fontSize: 10 },
        }
      : undefined,
    radar: {
      indicator: indicators,
      shape: 'polygon',
      axisName: { color: 'var(--text-muted)', fontSize: compact ? 10 : 11 },
      splitArea: { areaStyle: { color: ['rgba(242,169,59,0.03)', 'rgba(242,169,59,0.06)'] } },
      splitLine: { lineStyle: { color: 'var(--border-subtle)' } },
      axisLine: { lineStyle: { color: 'var(--border-subtle)' } },
      radius: compact ? '62%' : '68%',
      center: compact ? ['50%', '50%'] : ['50%', '50%'],
    },
    series,
  };

  return (
    <div className="radar-chart">
      {title && !compact && <h3 className="radar-chart__title">{title}</h3>}
      <ReactECharts
        option={option}
        style={{ height: h - (title && !compact ? 34 : 0), width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}