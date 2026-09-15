import React, { useId } from 'react';

const ANGLES = [90, 30, -30, -90, -150, 150];
const CENTER_X = 200;
const CENTER_Y = 180;
const RADIUS = 120;

const PALETTE = {
  dark: {
    ring: '#273647',
    ringMid: '#1c2b3c',
    ringInner: '#122131',
    gridLine: '#273647',
    baselineFill: 'rgba(44, 58, 76, 0.3)',
    baselineStroke: '#c3c6d2',
    polyStroke: '#dc2626',
    vertexFill: '#ffb95f',
    labelFill: '#d4e4fa',
    labelAccentFill: '#ffb95f',
    fillFrom: '#dc2626',
    fillTo: '#ffb95f',
    glow: 'drop-shadow(0 0 8px rgba(220,38,38,0.7))',
  },
  light: {
    ring: '#cbd5e1',
    ringMid: '#e2e8f0',
    ringInner: '#f1f5f9',
    gridLine: '#cbd5e1',
    baselineFill: 'rgba(226, 232, 240, 0.6)',
    baselineStroke: '#94a3b8',
    polyStroke: '#022448',
    vertexFill: '#006399',
    labelFill: '#0f172a',
    labelAccentFill: '#0f172a',
    fillFrom: '#022448',
    fillTo: '#006399',
    glow: 'none',
  },
};

const LABELS = [
  { x: 200, y: 44, anchor: 'middle' },
  { x: 315, y: 122, anchor: 'start' },
  { x: 315, y: 244, anchor: 'start' },
  { x: 200, y: 324, anchor: 'middle', accent: true },
  { x: 85, y: 244, anchor: 'end' },
  { x: 85, y: 122, anchor: 'end' },
];

function pt(value, index) {
  const r = ((Math.max(0, Math.min(100, value)) / 100) * RADIUS);
  const a = (ANGLES[index] * Math.PI) / 180;
  const x = CENTER_X + r * Math.cos(a);
  const y = CENTER_Y - r * Math.sin(a);
  return [x, y];
}

function toPoints(values) {
  return values
    .map((v, i) => pt(v, i))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
}

function ringPoints(radius) {
  return valuesToPoints([radius / RADIUS, radius / RADIUS, radius / RADIUS, radius / RADIUS, radius / RADIUS, radius / RADIUS]);
}

function valuesToPoints(fractionValues) {
  return fractionValues
    .map((f, i) => pt(f * 100, i))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
}

export default function PlayerRadar({ values, labels, baseline, theme = 'dark' }) {
  const gid = useId();
  const c = PALETTE[theme] || PALETTE.dark;
  const positions = values.map((v, i) => pt(v, i));
  const spokes = ANGLES.map((a, i) => {
    const [x, y] = pt(100, i);
    return { x1: CENTER_X, y1: CENTER_Y, x2: x.toFixed(1), y2: y.toFixed(1) };
  });
  const rings = [RADIUS, RADIUS * 0.8, RADIUS * 0.6, RADIUS * 0.4, RADIUS * 0.2];

  return (
    <svg
      viewBox="0 0 400 360"
      className="prf__radar"
      role="img"
      aria-label="Radar de rendimiento del jugador"
    >
      <defs>
        <linearGradient id={`${gid}-fill`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.fillFrom} stopOpacity="0.55" />
          <stop offset="100%" stopColor={c.fillTo} stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {rings.map((r, i) => (
        <polygon
          key={r}
          fill="none"
          points={ringPoints(r)}
          stroke={i >= 3 ? c.ringMid : c.ring}
          strokeDasharray={i === 0 ? '3 3' : i === 1 ? '2 2' : undefined}
          strokeWidth="1"
        />
      ))}

      {spokes.map((s, i) => (
        <line key={i} stroke={c.gridLine} strokeWidth="1" {...s} />
      ))}

      <polygon
        fill={c.baselineFill}
        points={toPoints(baseline)}
        stroke={c.baselineStroke}
        strokeDasharray="4 2"
        strokeWidth="1.5"
      />

      <polygon
        fill={`url(#${gid}-fill)`}
        points={toPoints(values)}
        stroke={c.polyStroke}
        strokeWidth="2.5"
        style={{ filter: c.glow }}
      />

      {positions.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} fill={c.vertexFill} r="4.5" stroke={c.polyStroke} strokeWidth="2" />
      ))}

      {labels.map((label, i) => {
        const pos = LABELS[i];
        return (
          <text
            key={label}
            textAnchor={pos.anchor}
            x={pos.x}
            y={pos.y}
            className="prf__radar-label"
            fill={pos.accent ? c.labelAccentFill : c.labelFill}
          >
            {label} {Math.round(values[i])}%
          </text>
        );
      })}
    </svg>
  );
}