import ReactECharts from 'echarts-for-react';

const readVar = (name, fallback) => {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

const shade = (hex, percent) => {
  const norm = hex.replace('#', '');
  const full = norm.length === 3 ? norm.split('').map((c) => c + c).join('') : norm;
  const num = parseInt(full, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const truncate = (name, max = 12) =>
  name.length > max ? `${name.slice(0, max - 1)}…` : name;

export default function BarChart({ teams, values, title }) {
  const amber = readVar('--accent', '#f59e0b');
  const amberDeep = shade(amber, -25);
  const amberSoft = readVar('--accent-soft', 'rgba(242,169,59,0.14)');

  const maxIdx = values.indexOf(Math.max(...values));
  const bars = values.map((v, i) => ({
    value: v,
    itemStyle:
      i === maxIdx
        ? {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: amber },
                { offset: 1, color: shade(amber, 10) },
              ],
            },
            borderRadius: [4, 4, 0, 0],
            shadowBlur: 14,
            shadowColor: amberSoft,
          }
        : {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: amber },
                { offset: 1, color: amberDeep },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
  }));

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
      axisLabel: { color: 'var(--text-muted)', fontSize: 10, rotate: 0, formatter: truncate },
      axisLine: { lineStyle: { color: 'var(--border-subtle)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'var(--text-muted)', fontSize: 11 },
      splitLine: { lineStyle: { color: 'var(--border-subtle)', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: bars,
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