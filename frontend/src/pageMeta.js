// Metadatos SEO por ruta (title + description). Se aplican dinámicamente
// sobre document.title y las meta tags al cambiar de ruta en la SPA.

import { useEffect } from 'react';
import { REPORT_ROUTES } from './routes';
import { INFO_PAGES } from './components/infoPages/infoContent';

const BRAND = 'Liga Nacional de Béisbol';

const PAGE_META = {
  '/': {
    title: 'LNB PRO — Gestión oficial de campeonatos',
    description:
      'Circuito élite y plataforma oficial de gestión deportiva: telemetría, rosters, calendario de la Serie Nacional 2025-2026 y reportes estadísticos certificados con datos reales de la liga.',
  },
  '/registro': {
    title: 'Crear cuenta',
    description:
      'Regístrate gratis en la Liga Nacional de Béisbol: guarda equipos y jugadores favoritos, recibe notificaciones y consulta tu panel personal.',
  },
  '/comparar': {
    title: 'Comparador de peloteros',
    description:
      'Compara jugadores de la liga por posición, estadísticas ofensivas, defensivas y rendimiento.',
  },
  '/altas-bajas': {
    title: 'Altas y bajas semanales',
    description:
      'Movimientos de roster semanales de la Serie Nacional: altas, bajas y cambios registrados por la mesa de control.',
  },
  '/dt/cambios': {
    title: 'Panel de cambios — Directores Técnicos',
    description:
      'Portal técnico WBSC para directores técnicos: gestión de alineaciones titulares, bullpen activo y ejecución de sustituciones.',
  },
  '/dt/listar-cambios': {
    title: 'Historial de cambios técnicos',
    description:
      'Registro histórico de los cambios de jugadores de la Serie Nacional, con aprobación WBSC y trazabilidad completa.',
  },
};

const PREFIX_META = [
  {
    prefix: '/admin/',
    meta: {
      title: 'Panel administrativo',
      description:
        'Administración de datos de la liga: personas, equipos, jugadores, series, temporadas y puntuaciones.',
    },
  },
  {
    prefix: '/consultas/',
    meta: {
      title: 'Consultas dinámicas',
      description:
        'Consulta las tablas oficiales de la liga con filtros dinámicos: equipos, juegos, series, temporadas y pitchers.',
    },
  },
  {
    prefix: '/jugador/',
    meta: {
      title: 'Perfil de jugador',
      description:
        'Ficha oficial del pelotero: estadísticas ofensivas, pitcheo, experiencia y radar de rendimiento.',
    },
  },
  {
    prefix: '/equipo/',
    meta: {
      title: 'Perfil de equipo',
      description:
        'Roster, estadísticas colectivas, campeonatos por serie y calendario del equipo.',
    },
  },
];

export const NOT_FOUND_META = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe o fue movida.',
};

export function resolvePageMeta(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];

  for (const { prefix, meta } of PREFIX_META) {
    if (pathname.startsWith(prefix)) return meta;
  }

  if (pathname.startsWith('/reporte/')) {
    const slug = pathname.slice('/reporte/'.length);
    const report = REPORT_ROUTES[slug];
    if (report) {
      return {
        title: report.short,
        description: `Reporte oficial de la liga: ${report.name}.`,
      };
    }
    return {
      title: 'Reportes oficiales',
      description: 'Reportes estadísticos oficiales certificados de la Liga Nacional de Béisbol.',
    };
  }

  const info = INFO_PAGES[pathname];
  if (info) return { title: info.title, description: info.lead || '' };

  return NOT_FOUND_META;
}

export function usePageMeta(pathname) {
  useEffect(() => {
    const meta = resolvePageMeta(pathname);
    const title = meta.title.includes(BRAND)
      ? meta.title
      : `${meta.title} · ${BRAND}`;
    const description = meta.description || '';

    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', description);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute('content', window.location.href);
  }, [pathname]);
}