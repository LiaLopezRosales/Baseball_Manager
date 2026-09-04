// Helpers para convertir opción (selectedOption) <-> ruta URL
import {
  CRUD_ROUTES,
  REPORT_ROUTES,
} from './routes';

const CRUD_OPTION_TO_SLUG = Object.entries(CRUD_ROUTES).reduce(
  (acc, [slug, option]) => ({ ...acc, [option]: slug }),
  {}
);

export const toCRUDPath = (option) =>
  CRUD_OPTION_TO_SLUG[option]
    ? `/admin/${CRUD_OPTION_TO_SLUG[option]}`
    : '/';

export const toReportPath = (option) => {
  const entry = Object.entries(REPORT_ROUTES).find(
    ([, v]) => v.name === option
  );
  return entry ? `/reporte/${entry[0]}` : '/';
};

export const toQueryPath = (table) => `/consultas/${table}`;

export const toMainPath = () => '/';
export const toSwapDefinePath = () => '/dt/cambios';
export const toSwapListPath = () => '/dt/listar-cambios';
