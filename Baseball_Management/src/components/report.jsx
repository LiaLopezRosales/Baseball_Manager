import React, { useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Download, RefreshCw, Printer } from 'lucide-react';
import { API_URL } from '../api';
import GradientSpinner from './ui/GradientSpinner';
import { BoletínContext } from '../reportBoletinContext';
import './report.css';

const PAGE_SIZE = 10;

/* ─── Campos del panel de filtros (label + control) ─── */
function Field({ label, children }) {
  return (
    <div className="rep__filter-field">
      {label && <label className="rep__filter-label">{label}</label>}
      {children}
    </div>
  );
}

function SelectField({ label, value, onChange, children, placeholder }) {
  return (
    <Field label={label}>
      <div className="rep__filter-select">
        <select value={value} onChange={onChange}>
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        <span className="material-symbols-outlined" aria-hidden="true">
          expand_more
        </span>
      </div>
    </Field>
  );
}

function TextField({ label, value, onChange, placeholder, icon }) {
  return (
    <Field label={label}>
      <div className="rep__filter-input">
        {icon && (
          <span className="material-symbols-outlined" aria-hidden="true">
            {icon}
          </span>
        )}
        <input type="text" value={value} onChange={onChange} placeholder={placeholder} />
      </div>
    </Field>
  );
}

/* ─── Selector de parámetros del reporte (envuelto en controles etiquetados) ─── */
function ParamsSelector({ report_id, onTeamSelect, onPitcherSelect, onPitcherLNSelect, onSeasonSelect, onSeriesSelect }) {
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [series, setSeries] = useState([]);

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPitcherN, setSelectedPitcherN] = useState('');
  const [selectedPitcherLn, setSelectedPitcherLn] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');

  /* Filtro default pre-cargado (una sola vez por reporte): el select abre con la
     primera opción para que el cliente nunca vea la tabla vacía. */
  const defaultsApplied = useRef(false);
  const defaultForReport = useRef(null);

  useEffect(() => {
    if (defaultsApplied.current) return;
    if (defaultForReport.current !== report_id) {
      defaultForReport.current = report_id;
      defaultsApplied.current = false;
    }
    let applied = false;
    if ((report_id === 0 || report_id === 2) && seasons.length > 0 && !selectedSeason) {
      setSelectedSeason(seasons[0].name);
      onSeasonSelect(seasons[0].name);
      applied = true;
    }
    if (report_id === 1 && series.length > 0 && !selectedSeries) {
      setSelectedSeries(series[0].name);
      onSeriesSelect(series[0].name);
      applied = true;
    }
    if (report_id === 8 && teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].name);
      onTeamSelect(teams[0].name);
      applied = true;
    }
    if (applied) defaultsApplied.current = true;
  }, [
    report_id,
    teams,
    seasons,
    series,
    selectedSeason,
    selectedSeries,
    selectedTeam,
    onSeasonSelect,
    onSeriesSelect,
    onTeamSelect,
  ]);

  useEffect(() => {
    const load = (url, setter) =>
      fetch(`${API_URL}${url}`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setter)
        .catch(() => setter([]));
    load('/teams', setTeams);
    load('/seasons', setSeasons);
    load('/series', setSeries);
  }, []);

  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
    onTeamSelect(e.target.value);
  };
  const handlePitcherChange = (e) => {
    setSelectedPitcherN(e.target.value);
    onPitcherSelect(e.target.value);
  };
  const handlePitcherLastnameChange = (e) => {
    setSelectedPitcherLn(e.target.value);
    onPitcherLNSelect(e.target.value);
  };
  const handleSeasonChange = (e) => {
    setSelectedSeason(e.target.value);
    onSeasonSelect(e.target.value);
  };
  const handleSeriesChange = (e) => {
    setSelectedSeries(e.target.value);
    onSeriesSelect(e.target.value);
  };

  const renderOptions = (list) =>
    list.map((option) => (
      <option key={option.id} value={option.name}>
        {option.name}
      </option>
    ));

  let control = null;
  switch (report_id) {
    case 0:
    case 2:
      control = (
        <SelectField
          label="Temporada"
          placeholder="-- Selecciona una temporada --"
          value={selectedSeason}
          onChange={handleSeasonChange}
        >
          {renderOptions(seasons)}
        </SelectField>
      );
      break;
    case 1:
      control = (
        <SelectField
          label="Serie Oficial"
          placeholder="-- Selecciona una serie --"
          value={selectedSeries}
          onChange={handleSeriesChange}
        >
          {renderOptions(series)}
        </SelectField>
      );
      break;
    case 4:
      control = (
        <>
          <TextField
            label="Nombre del Pitcher"
            placeholder="Nombre"
            value={selectedPitcherN}
            onChange={handlePitcherChange}
          />
          <TextField
            label="Apellido del Pitcher"
            placeholder="Apellido"
            value={selectedPitcherLn}
            onChange={handlePitcherLastnameChange}
          />
        </>
      );
      break;
    case 8:
      control = (
        <SelectField
          label="Equipo"
          placeholder="-- Selecciona un equipo --"
          value={selectedTeam}
          onChange={handleTeamChange}
        >
          {renderOptions(teams)}
        </SelectField>
      );
      break;
    default:
      control = null;
  }

  return control;
}

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return value.toLocaleString('es-MX');
  return String(value);
};

const ReportComponent = ({ report_id, report_name, report_short, report_icon }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [printAll, setPrintAll] = useState(false);

  const [team_name, setSelectedTeam] = useState('');
  const [pitcher_name, setSelectedPitcher] = useState('');
  const [pitcher_lastname, setSelectedPitcherLastname] = useState('');
  const [season_name, setSelectedSeason] = useState('');
  const [serie_name, setSelectedSeries] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportError, setExportError] = useState('');

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const isLogged = !!localStorage.getItem('token');

  const fetchSeq = useRef(0);

  const setBoletín = useContext(BoletínContext);

  const buildParams = () => {
    switch (report_id) {
      case 0:
      case 2:
        return new URLSearchParams({ report_id, season_name });
      case 1:
        return new URLSearchParams({ report_id, serie_name });
      case 4:
        return new URLSearchParams({ report_id, pitcher_name, pitcher_lastname });
      case 8:
        return new URLSearchParams({ report_id, team_name });
      default:
        return new URLSearchParams({ report_id });
    }
  };

  const fetchReport = () => {
    setLoading(true);
    setError(null);
    setPage(1);
    const requestId = ++fetchSeq.current;
    fetch(`${API_URL}/api/queries/reports/?${buildParams().toString()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al obtener el reporte');
        }
        return response.json();
      })
      .then((result) => {
        if (requestId !== fetchSeq.current) return;
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (requestId !== fetchSeq.current) return;
        setError(err);
        setLoading(false);
      });
  };

  const openSource = () => {
    window.open(`${API_URL}/api/queries/reports/?${buildParams().toString()}`, '_blank', 'noopener,noreferrer');
  };

  const handleExport = async (formatOverride) => {
    if (!isLogged) {
      setExportError('Debes iniciar sesión para exportar.');
      return;
    }
    setExportError('');
    const format = typeof formatOverride === 'string' ? formatOverride : exportFormat;
    const exportData = {
      filename: report_name,
      format,
      data: {
        [report_name]: Array.isArray(data) ? data : data || [],
      },
    };

    try {
      const response = await fetch(`${API_URL}/api/queries/export/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Token ${localStorage.getItem('token')}` } : {}),
        },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report_name}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
    }
  };

  /* Registro del "boletín técnico" para el footer de la layout (contexto mutado
     en cada render para que el footer siempre use el handler vigente). */
  const boletínRef = useRef(null);
  if (!boletínRef.current) boletínRef.current = { title: report_name, onDownload: null };
  boletínRef.current.title = report_name;
  boletínRef.current.onDownload = () => handleExport('pdf');

  useEffect(() => {
    if (!setBoletín) return undefined;
    setBoletín(boletínRef.current);
    return () => setBoletín(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBoletín]);

  /* Imprimir la boleta completa (todas las filas del corte). */
  useEffect(() => {
    const before = () => setPrintAll(true);
    const after = () => setPrintAll(false);
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  const handlePrint = () => {
    flushSync(() => setPrintAll(true));
    const printAndReset = () => {
      window.print();
      setPrintAll(false);
    };
    if (window.requestAnimationFrame) window.requestAnimationFrame(printAndReset);
    else printAndReset();
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report_id, season_name, serie_name, pitcher_name, pitcher_lastname, team_name]);

  if (loading) {
    return (
      <div className="rep">
        <div className="rep__state">
          <GradientSpinner label="Cargando reporte…" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rep">
        <div className="rep__state rep__state--error">
          <p>No se pudo cargar el reporte: {error.message}</p>
          <button className="rep__btn rep__btn--solid" onClick={fetchReport}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={16} /> Reintentar
            </span>
          </button>
        </div>
      </div>
    );
  }

  const rawRows = Array.isArray(data) ? data : data && data[''] ? data[''] : null;
  const headers = rawRows && rawRows.length ? Object.keys(rawRows[0]) : [];

  const isNumericCol = (k) =>
    !!rawRows &&
    rawRows.length > 0 &&
    rawRows.every((r) => r[k] !== null && r[k] !== undefined && r[k] !== '' && !Number.isNaN(Number(r[k])));

  /* Detección heurística de columnas por nombre (fila rica tipo referencia) */
  const firstNameKey = headers.find((k) => ['nombre', 'name'].includes(norm(k)));
  const lastNameKey = headers.find(
    (k) => ['apellido', 'apellidos', 'lastname', 'last_name', 'last_names'].includes(norm(k))
  );
  const posKey = headers.find(
    (k) => norm(k).includes('posicion') || norm(k).includes('position') || norm(k) === 'rol'
  );
  const serieKey = headers.find((k) => norm(k) === 'serie' || norm(k) === 'series' || norm(k).startsWith('serie'));
  const metricKey = headers.find(
    (k) =>
      ['efectividad', 'promedio', 'average', 'avg', 'porcentaje', 'porcent', 'factor'].some((t) =>
        norm(k).includes(t)
      ) && isNumericCol(k)
  );

  const nameKeys = [firstNameKey, lastNameKey].filter(Boolean);
  const subKeys = headers.filter(
    (k) => !nameKeys.includes(k) && k !== posKey && k !== serieKey && k !== metricKey && !isNumericCol(k)
  );
  const thKeys = headers.filter((k) => k !== lastNameKey);

  /* Filtros activos (cliente) sobre la fila completa */
  const q = appliedSearch.trim().toLowerCase();
  const enabledRows = q
    ? rawRows.filter((r) => JSON.stringify(Object.values(r)).toLowerCase().includes(q))
    : rawRows || [];

  const total = enabledRows.length;
  const totalPages = total ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageRows = total ? enabledRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE) : [];
  const viewRows = printAll ? enabledRows : pageRows;
  const rankBase = printAll ? 0 : (safePage - 1) * PAGE_SIZE;
  const cols = headers.length;

  let leaderLabel = headers[0] || 'Registros';
  let leaderValue = '—';
  let leaderHint = 'Corte estadístico del reporte';
  if (enabledRows.length) {
    const numericCols = headers.filter(isNumericCol);
    if (numericCols.length) {
      leaderLabel = numericCols[0];
      let max = -Infinity;
      let maxRow = null;
      enabledRows.forEach((r) => {
        const n = Number(r[leaderLabel]);
        if (n > max) {
          max = n;
          maxRow = r;
        }
      });
      leaderValue = formatValue(max);
      const leftover = headers.filter((k) => k !== leaderLabel).slice(0, 2);
      if (maxRow) {
        const vals = leftover.map((k) => maxRow[k]).filter((v) => v !== null && v !== undefined && v !== '');
        if (vals.length) leaderHint = vals.map(String).join(' • ');
      }
    } else {
      leaderValue = formatValue(enabledRows[0][headers[0]]);
      leaderHint = 'Valor del primer registro del corte';
    }
  }

  const kpis = [
    {
      label: 'Total Registros',
      value: total.toLocaleString('es-MX'),
      suffix: 'registros',
      chip: `${totalPages} páginas`,
      chipTone: 'amber',
      sub: 'Filas del corte estadístico vigente',
      tone: '',
    },
    {
      label: 'Líder',
      value: leaderValue,
      suffix: leaderLabel,
      chip: 'Top 1',
      chipTone: 'red',
      sub: leaderHint,
      tone: 'amber',
    },
    {
      label: 'En Vista',
      value: pageRows.length.toLocaleString('es-MX'),
      suffix: 'filas',
      chip: 'Página activa',
      chipTone: '',
      sub: 'Registros mostrados en la página actual',
      tone: '',
    },
    {
      label: 'Columnas',
      value: cols.toLocaleString('es-MX'),
      suffix: 'columnas',
      chip: 'Tabla oficial',
      chipTone: '',
      sub: 'Estructura del corte estadístico',
      tone: '',
    },
  ];

  /* Chips de filtros activos (params + búsqueda) */
  const chips = [];
  if (season_name) chips.push({ id: 'season', label: `Temporada: ${season_name}` });
  if (serie_name) chips.push({ id: 'serie', label: `Serie: ${serie_name}` });
  if (team_name) chips.push({ id: 'team', label: `Equipo: ${team_name}` });
  if (pitcher_name) chips.push({ id: 'pitcher', label: `Pitcher: ${[pitcher_name, pitcher_lastname].filter(Boolean).join(' ')}` });
  if (appliedSearch) chips.push({ id: 'search', label: `Búsqueda: "${appliedSearch}"` });

  const removeChip = (id) => {
    if (id === 'season') setSelectedSeason('');
    if (id === 'serie') setSelectedSeries('');
    if (id === 'team') setSelectedTeam('');
    if (id === 'pitcher') {
      setSelectedPitcher('');
      setSelectedPitcherLastname('');
    }
    if (id === 'search') {
      setAppliedSearch('');
      setSearch('');
    }
  };

  const clearAll = () => {
    setSelectedSeason('');
    setSelectedSeries('');
    setSelectedTeam('');
    setSelectedPitcher('');
    setSelectedPitcherLastname('');
    setAppliedSearch('');
    setSearch('');
  };

  const renderPageNumbers = () => {
    if (totalPages <= 1) return null;
    const items = [];
    const push = (p, label = String(p), key = p, active = p === safePage) =>
      items.push(
        <button
          key={key}
          type="button"
          className={`rep__page${active ? ' rep__page--active' : ''}`}
          onClick={() => setPage(p)}
          aria-current={active ? 'page' : undefined}
        >
          {label}
        </button>
      );
    push(1, '1');
    if (totalPages <= 7) {
      for (let p = 2; p <= totalPages; p += 1) push(p);
      return items;
    }
    if (safePage > 3) items.push(<span key="e1" className="rep__page-gap">…</span>);
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p += 1) push(p);
    if (safePage < totalPages - 2) items.push(<span key="e2" className="rep__page-gap">…</span>);
    push(totalPages, String(totalPages), totalPages);
    return items;
  };

  const start = total ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(safePage * PAGE_SIZE, total);

  const renderMetric = (item, rank) => {
    const v = item[metricKey];
    const num = Number(v);
    const isRatio = num >= 0 && num <= 1;
    const pct = isRatio ? Math.round(num * 1000) / 10 : null;
    const barW = isRatio ? Math.min(100, Math.round(num * 1000) / 10) : null;
    return (
      <div className="rep__metric">
        <div className="rep__metric-top">
          <span className={`rep__metric-val${rank === 1 ? ' rep__metric-val--lead' : ''}`}>
            {formatValue(v)}
          </span>
          {pct !== null && <span className="rep__metric-pct">{pct}%</span>}
        </div>
        {barW !== null && (
          <div className="rep__bar">
            <span
              className={`rep__bar-fill${rank === 1 ? ' rep__bar-fill--lead' : ''}`}
              style={{ width: `${barW}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rep">
      {/* ─── Header stage ─── */}
      <div className="rep__stage">
        <div className="rep__badges">
          <span className="rep__badge rep__badge--hl">
            {report_icon && (
              <span className="material-symbols-outlined rep__badge-icon" aria-hidden="true">
                {report_icon}
              </span>
            )}
            {report_short || report_name}
          </span>
          <span className="rep__badge rep__badge--ghost">Oficial LNB PRO</span>
          <span className="rep__badge rep__badge--wbsc">
            <span className="rep__wbsc-dot" aria-hidden="true" />
            Normativa WBSC
          </span>
        </div>

        <div className="rep__stage-row">
          <div className="rep__stage-text">
            <h1>Líderes de Rendimiento Técnico</h1>
            <p className="rep__subtitle">
              Portal oficial de estadísticas y rendimiento por Serie y posición
              defensiva con coeficientes homologados WBSC 2024 para aficionados,
              analistas y prensa.
            </p>
          </div>
          <div className="rep__actions">
            <button type="button" className="rep__btn rep__btn--ghost" onClick={() => handleExport()}>
              <Download size={16} /> Exportar Datos
            </button>
            <button type="button" className="rep__btn rep__btn--solid" onClick={handlePrint}>
              <Printer size={16} /> Imprimir Boleta
            </button>
          </div>
        </div>

        {!isLogged && <p className="rep__lock-note">🔒 Inicia sesión para exportar reportes</p>}
        {exportError && <p className="rep__lock-note">{exportError}</p>}
      </div>

      {/* Cabecera visible solo en impresión */}
      <div className="rep__print-head">
        LNB PRO · {report_short || report_name} — {new Date().toLocaleDateString('es-MX')} · Corte estadístico oficial
      </div>

      {/* ─── KPIs reales ─── */}
      <div className="rep__kpis">
        {kpis.map((k) => (
          <div key={k.label} className={`rep__kpi${k.tone ? ` rep__kpi--${k.tone}` : ''}`}>
            <div className="rep__kpi-head">
              <span className="rep__kpi-label">{k.label}</span>
              {k.chip && (
                <span className={`rep__kchip${k.chipTone ? ` rep__kchip--${k.chipTone}` : ''}`}>{k.chip}</span>
              )}
            </div>
            <div className="rep__kpi-value-row">
              <span className="rep__kpi-value">{k.value}</span>
              {k.suffix && <span className="rep__kpi-suffix">{k.suffix}</span>}
            </div>
            <p className="rep__kpi-sub">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ─── Barra de auditoría ─── */}
      <div className="rep__audit">
        <span className="rep__audit-icon" aria-hidden="true">
          <span className="material-symbols-outlined">verified_user</span>
        </span>
        <div className="rep__audit-text">
          <div className="rep__audit-head">
            <strong>Auditoría Registral de Base de Datos Homologada</strong>
            <span className="rep__audit-sync">
              <span className="rep__audit-pulse" aria-hidden="true" />
              SINCRONIZADO
            </span>
          </div>
          <p>
            Los {total.toLocaleString('es-MX')} registros del corte corresponden a
            la base de datos homologada LNB PRO (registro original verificado).
          </p>
        </div>
        <button type="button" className="rep__btn rep__btn--ghost rep__audit-btn" onClick={openSource}>
          <span className="material-symbols-outlined" aria-hidden="true">
            open_in_new
          </span>
          Ver Hoja Fuente
        </button>
      </div>

      {/* ─── Panel de filtros ─── */}
      <div className="rep__filter">
        <div className="rep__filter-grid">
          <ParamsSelector
            key={report_id}
            report_id={report_id}
            onTeamSelect={setSelectedTeam}
            onPitcherSelect={setSelectedPitcher}
            onPitcherLNSelect={setSelectedPitcherLastname}
            onSeasonSelect={setSelectedSeason}
            onSeriesSelect={setSelectedSeries}
          />

          <TextField
            label="Buscar en la tabla"
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre, valor exacto…"
          />

          {isLogged && (
            <Field label="Formato de exportación">
              <div className="rep__filter-select">
                <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </select>
                <span className="material-symbols-outlined" aria-hidden="true">
                  expand_more
                </span>
              </div>
            </Field>
          )}

          <div className="rep__filter-actions">
            <button type="button" className="rep__btn rep__btn--solid" onClick={() => setAppliedSearch(search.trim())}>
              <span className="material-symbols-outlined" aria-hidden="true">
                filter_alt
              </span>
              Aplicar
            </button>
            <button type="button" className="rep__btn rep__btn--ghost" onClick={clearAll}>
              <span className="material-symbols-outlined" aria-hidden="true">
                restart_alt
              </span>
              Limpiar
            </button>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="rep__chips">
            <span className="rep__chips-label">Filtros activos:</span>
            {chips.map((c) => (
              <span key={c.id} className="rep__fchip">
                {c.label}
                <button
                  type="button"
                  aria-label={`Quitar ${c.label}`}
                  className="rep__fchip-close"
                  onClick={() => removeChip(c.id)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    close
                  </span>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ─── Tabla oficial (card) ─── */}
      <div className="rep__table-card">
        {headers.length > 0 ? (
          <>
            <div className="rep__table-sub">
              <div className="rep__table-sub-title">
                <span className="material-symbols-outlined" aria-hidden="true">
                  table_chart
                </span>
                <strong>Tabla Oficial {report_short || report_name}</strong>
              </div>
              <div className="rep__table-sub-meta">
                <span className="rep__count">({pageRows.length} en vista)</span>
                <span className="rep__order">
                  <span className="rep__order-label">Orden:</span> tabla oficial LNB PRO
                </span>
              </div>
            </div>

            <div className="rep__table-wrap">
              <table className="rep__table">
                <thead>
                  <tr>
                    <th className="rep__th-rank" aria-label="Posición">
                      #
                    </th>
                    {thKeys.map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewRows.map((item, index) => {
                    const rank = rankBase + index + 1;
                    return (
                      <tr key={`${safePage}-${index}`}>
                        <td className="rep__td-rank">
                          <span className={`rep__rank-badge${rank === 1 ? ' rep__rank-badge--lead' : ''}`}>
                            {rank}
                          </span>
                        </td>
                        {thKeys.map((key) => {
                          if (key === firstNameKey) {
                            const last = lastNameKey ? item[lastNameKey] : null;
                            const firstV = item[key];
                            const full = [firstV, last]
                              .filter((v) => v !== null && v !== undefined && v !== '')
                              .join(' ');
                            const initials = full.split(/\s+/).map((w) => (w ? w[0] : '')).join('').slice(0, 2).toUpperCase() || '?';
                            const subline = subKeys
                              .map((k) => item[k])
                              .filter((v) => v !== null && v !== undefined && v !== '' && String(v).trim() !== '')
                              .slice(0, 3)
                              .join('  •  ');
                            return (
                              <td key={key} className="rep__cell-player">
                                <div className="rep__player">
                                  <span className="rep__avatar" aria-hidden="true">
                                    {initials}
                                  </span>
                                  <span className="rep__player-info">
                                    <strong>{String(firstV ?? '').toUpperCase()}</strong>
                                    {subline && <em>{subline}</em>}
                                  </span>
                                </div>
                              </td>
                            );
                          }
                          if (key === lastNameKey) return null;
                          if (key === posKey) {
                            return (
                              <td key={key}>
                                <span className="rep__pill rep__pill--pos">
                                  <span className="rep__pill-dot" aria-hidden="true" />
                                  {item[key]}
                                </span>
                              </td>
                            );
                          }
                          if (key === serieKey) {
                            return (
                              <td key={key}>
                                <span className="rep__pill rep__pill--serie">{item[key]}</span>
                              </td>
                            );
                          }
                          if (key === metricKey && isNumericCol(key)) {
                            return <td key={key}>{renderMetric(item, rank)}</td>;
                          }
                          return <td key={key}>{item[key] ?? '—'}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="rep__pagination">
              <span className="rep__pagination-info">
                Mostrando <strong>{start}</strong> - <strong>{end}</strong> de{' '}
                <strong>{total.toLocaleString('es-MX')}</strong> registros computados
              </span>
              <div className="rep__pagination-controls">
                <button
                  type="button"
                  className="rep__page rep__page--chev"
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Página anterior"
                  title="Anterior"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_left
                  </span>
                </button>
                {renderPageNumbers()}
                <button
                  type="button"
                  className="rep__page rep__page--chev"
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  aria-label="Página siguiente"
                  title="Siguiente"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </>
        ) : data ? (
          <pre className="rep__pre">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <div className="rep__empty">No hay datos para este reporte.</div>
        )}
      </div>
    </div>
  );
};

export default ReportComponent;