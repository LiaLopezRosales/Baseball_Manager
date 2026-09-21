// Baseball_Management/src/components/ui/RadarChart.test.jsx
// WP5 - RadarChart (ui): convierte stats [{label,value,max}] en un radar con
// un eje por stat y serie principal "Valor"; con baseline agrega la serie
// "Media LNB" punteada + leyenda. echarts-for-react se mockea (jsdom no
// tiene canvas) capturando el option que se le pasa al componente.
import React from 'react';
import { render, screen } from '@testing-library/react';
import RadarChart from './RadarChart';

let mockOptionEchart = null;
jest.mock('echarts-for-react', () => {
  const React2 = require('react');
  return {
    __esModule: true,
    default: ({ option }) => {
      mockOptionEchart = option;
      return React2.createElement('div', { 'data-testid': 'echart-stub' });
    },
  };
});

const stats = [
  { label: 'Bateo', value: 0.4, max: 1 },
  { label: 'Juegos', value: 8, max: 15 },
  { label: 'Experiencia', value: 75, max: 100 },
  { label: 'Edad', value: 5, max: 8 },
];

describe('RadarChart (WP5)', () => {
  beforeEach(() => {
    mockOptionEchart = null;
  });

  it('sin baseline: un eje por stat y una sola serie llamada Valor', () => {
    render(<RadarChart stats={stats} />);

    expect(screen.getByTestId('echart-stub')).toBeInTheDocument();
    expect(mockOptionEchart).toBeTruthy();
    expect(mockOptionEchart.radar.indicator.map((i) => i.name)).toEqual(['Bateo', 'Juegos', 'Experiencia', 'Edad']);
    expect(mockOptionEchart.series).toHaveLength(1);
    expect(mockOptionEchart.series[0].name).toBe('Valor');
  });

  it('con baseline: agrega la serie Media LNB punteada y la leyenda', () => {
    render(<RadarChart stats={stats} baseline={[0.35, 7, 70, 4]} />);

    expect(mockOptionEchart.series).toHaveLength(2);
    expect(mockOptionEchart.series[1].name).toBe('Media LNB');
    expect(mockOptionEchart.series[1].data[0].lineStyle.type).toBe('dashed');
    expect(mockOptionEchart.legend.data).toEqual(['Valor', 'Media LNB']);
  });
});
