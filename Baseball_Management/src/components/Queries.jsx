import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFieldsForTable } from './tables';
import Filters from './filters';
import { API_URL } from '../api';
import './Queries.css';

const fetchData = async (url, data) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
        }
        const text = await response.text();
        return text ? JSON.parse(text) : [];
    } catch (error) {
        console.error('Error en la solicitud:', error.message);
        return [];
    }
};

const tableNameMap = {
    Team: 'Equipos',
    Game: 'Juegos',
    Series: 'Series',
    Worker: 'Trabajadores',
    DirectionTeam: 'Equipos de Dirección',
    BaseballPlayer: 'Jugadores de Baseball',
    Season: 'Temporadas',
    Pitcher: 'Pitchers',
    TeamOnTheField: 'Equipo en Campo',
    StarPlayer: 'Jugador Estrella',
    PlayerInPosition: 'Jugadores en Posición',
    Score: 'Puntuaciones',
    BPParticipation: 'Participación de los Jugadores',
    PlayerSwap: 'Cambio de Jugador',
    PlayerInLineUp: 'Jugadores en Alineación',
};

const numericFields = [
    'running_average',
    'effectiveness',
    'batting_average',
    'years_of_experience',
    'No_games_won',
    'No_games_lost',
    'w_points',
    'l_points',
];

const dateFields = [
    'init_date',
    'end_date',
    'date',
    'series__init_date',
    'series__end_date',
];

// Tablas con ficha pública real → { tabla: rutaPorId }
const PROFILE_ROUTES = {
    Team: '/equipo/',
    BaseballPlayer: '/jugador/',
};

const OPERATOR_LABELS = {
    gte: '≥',
    lte: '≤',
    icontains: 'contiene',
    month: 'mes',
    year: 'año',
};

const formatDate = (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
};

const Queries = ({ selectedTable, onRequireAuth }) => {
    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);
    const [draftFilters, setDraftFilters] = useState({});
    const [appliedFilters, setAppliedFilters] = useState({});
    const [appliedTick, setAppliedTick] = useState(0);
    const [globalSearch, setGlobalSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState('');

    /* Carga inicial de campos al cambiar de tabla */
    useEffect(() => {
        if (selectedTable) {
            setFields(getFieldsForTable(selectedTable));
            setDraftFilters({});
            setAppliedFilters({});
            setAppliedTick((t) => t + 1);
            setGlobalSearch('');
            setData([]);
            setCurrentPage(1);
            setExportError('');
        }
    }, [selectedTable]);

    /* Consulta dinámica (solo se dispara al confirmar filtros) */
    useEffect(() => {
        let cancelled = false;
        const getData = async () => {
            if (!selectedTable || fields.length === 0) return;
            setLoading(true);
            const query = {
                table_name: selectedTable,
                fields: ['id', ...fields.map(([, field]) => field)],
                filters: appliedFilters,
            };
            const result = await fetchData(
                `${API_URL}/api/queries/dinamic-filter/`,
                query
            );
            if (!cancelled) {
                setData(result);
                setCurrentPage(1);
                setLoading(false);
            }
        };
        getData();
        return () => { cancelled = true; };
    }, [selectedTable, fields, appliedFilters, appliedTick]);

    const tableDisplayName = tableNameMap[selectedTable] || selectedTable;
    const profileBase = PROFILE_ROUTES[selectedTable];

    const formatValue = (value, field) => {
        if (numericFields.includes(field) && typeof value === 'number') {
            return value.toFixed(3);
        }
        if (dateFields.includes(field) && value) return formatDate(value);
        return value;
    };

    /* ------- Filtros: commit + chips ------- */
    const applyFilters = () => {
        setAppliedFilters({ ...draftFilters });
        setAppliedTick((t) => t + 1);
        setCurrentPage(1);
        setExportError('');
    };

    const resetFilters = () => {
        setDraftFilters({});
        setAppliedFilters({});
        setAppliedTick((t) => t + 1);
        setCurrentPage(1);
    };

    const removeFilter = (field, operator) => {
        const next = { ...appliedFilters };
        if (next[field] && operator in next[field]) {
            delete next[field][operator];
            if (Object.keys(next[field]).length === 0) delete next[field];
        }
        setDraftFilters(next);
        setAppliedFilters(next);
        setAppliedTick((t) => t + 1);
    };

    const activeChips = [];
    Object.entries(appliedFilters).forEach(([field, ops]) => {
        const header = (fields.find(([, f]) => f === field) || [field])[0];
        Object.entries(ops).forEach(([op, value]) => {
            activeChips.push({
                key: `${field}|${op}`,
                label: `${header}: ${OPERATOR_LABELS[op] || op} ${value}`,
                field,
                op,
            });
        });
    });

    /* ------- Filtro global (búsqueda local) ------- */
    const q = globalSearch.trim().toLowerCase();
    const filteredData = q
        ? data.filter((row) =>
              fields.some(([, f]) =>
                  String(row[f] ?? '').toLowerCase().includes(q)
              )
          )
        : data;

    /* ------- Paginación ------- */
    const totalRows = filteredData.length;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const pageNumbers = [];
    for (let p = 1; p <= totalPages; p++) {
        if (
            p === 1 ||
            p === totalPages ||
            (p >= currentPage - 2 && p <= currentPage + 2)
        ) {
            pageNumbers.push(p);
        } else if (pageNumbers[pageNumbers.length - 1] !== '…') {
            pageNumbers.push('…');
        }
    }

    /* ------- KPIs reales ------- */
    const numericEntry = fields.find(([, f]) => numericFields.includes(f));
    let kpiTop = { value: '—', unit: '', tone: '' };
    if (numericEntry) {
        const vals = data
            .map((r) => r[numericEntry[1]])
            .filter((v) => typeof v === 'number');
        if (vals.length) {
            kpiTop = {
                value: Math.max(...vals).toFixed(3),
                unit: `de ${data.length} registros`,
                tone: 'amber',
            };
        }
    } else if (fields.length) {
        const distinct = new Set(data.map((r) => r[fields[0][1]]));
        kpiTop = {
            value: distinct.size,
            unit: `distintos en ${fields[0][0]}`,
            tone: 'amber',
        };
    }

    const kpis = [
        {
            label: 'Registros Totales',
            value: String(data.length),
            unit: 'filas',
            tone: '',
            icon: 'dataset',
        },
        {
            label: numericEntry ? `Top ${numericEntry[0]}` : 'Valores Distintos',
            value: kpiTop.value,
            unit: kpiTop.unit,
            tone: kpiTop.tone === 'amber' ? 'amber' : 'green',
            icon: 'trending_up',
        },
        {
            label: 'Columnas',
            value: String(fields.length),
            unit: 'campos',
            tone: '',
            icon: 'view_column',
        },
        {
            label: 'Mostrando',
            value: totalRows ? `${startIndex + 1}–${startIndex + paginatedData.length}` : '0',
            unit: `de ${totalRows}`,
            tone: 'red',
            icon: 'table_rows',
        },
    ];

    /* ------- Exportación (PDF/CSV reales) ------- */
    const doExport = async (format) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setExportOpen(false);
            setExportError('Inicia sesión para exportar este padrón.');
            if (onRequireAuth) onRequireAuth();
            return;
        }
        setExporting(true);
        setExportError('');
        try {
            const rows = data.map((row) => {
                const clean = {};
                fields.forEach(([header, f]) => {
                    clean[String(header)] = formatValue(row[f], f);
                });
                return clean;
            });
            const res = await fetch(`${API_URL}/api/queries/export/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify({
                    data: { [tableDisplayName]: rows },
                    format,
                    filename: tableDisplayName.replace(/\s+/g, '_'),
                }),
            });
            if (!res.ok) {
                let msg = `Error ${res.status}`;
                try {
                    const body = await res.json();
                    if (body.error) msg = body.error;
                } catch { /* binario o vacío */ }
                throw new Error(msg);
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tableDisplayName.replace(/\s+/g, '_')}.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            setExportError(err.message);
        } finally {
            setExporting(false);
            setExportOpen(false);
        }
    };

    return (
        <div className="qry">
            {/* ═════════ CABECERA DE PÁGINA ═════════ */}
            <header className="qry__head">
                <div className="qry__head-main">
                    <div className="qry__head-icon" aria-hidden="true">
                        <span className="material-symbols-outlined">query_stats</span>
                    </div>
                    <div>
                        <div className="qry__head-title-row">
                            <h1 className="qry__title">{tableDisplayName}</h1>
                            <span className="qry__badge">Oficial</span>
                        </div>
                        <div className="qry__table-order">
                            Padrón oficial · Ordenado por {fields[0]?.[0] || tableDisplayName}
                        </div>
                    </div>
                </div>

                <div className="qry__actions">
                    <div className="qry__export">
                        <button
                            className="qry__btn"
                            onClick={() => setExportOpen((o) => !o)}
                            aria-haspopup="menu"
                            aria-expanded={exportOpen}
                            title="Exportar padrón (PDF o CSV)"
                        >
                            <span className="material-symbols-outlined qry__btn-icon qry__btn-icon--accent">
                                download
                            </span>
                            Exportar
                            <span className="material-symbols-outlined qry__btn-icon">
                                {exportOpen ? 'expand_less' : 'expand_more'}
                            </span>
                        </button>
                        {exportOpen && (
                            <div className="qry__export-menu" role="menu">
                                <button
                                    className="qry__export-item"
                                    role="menuitem"
                                    onClick={() => doExport('pdf')}
                                    disabled={exporting}
                                >
                                    <span className="material-symbols-outlined">picture_as_pdf</span>
                                    Exportar PDF
                                </button>
                                <button
                                    className="qry__export-item"
                                    role="menuitem"
                                    onClick={() => doExport('csv')}
                                    disabled={exporting}
                                >
                                    <span className="material-symbols-outlined">table_view</span>
                                    Exportar CSV
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="qry__btn" onClick={() => window.print()}>
                        <span className="material-symbols-outlined qry__btn-icon">print</span>
                        Imprimir
                    </button>
                </div>
            </header>

            {exportError && (
                <div className="qry__export-note" role="status">
                    <span className="material-symbols-outlined">lock</span>
                    {exportError}
                </div>
            )}

            {/* ═════════ KPIs ═════════ */}
            <section className="qry__kpis" aria-label="Resumen del padrón">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className={`qry__kpi${kpi.tone ? ` qry__kpi--${kpi.tone}` : ''}`}
                    >
                        <div className="qry__kpi-body">
                            <div className="qry__kpi-label">{kpi.label}</div>
                            <div className="qry__kpi-value-row">
                                <span
                                    className={`qry__kpi-value${
                                        kpi.tone ? ` qry__kpi-value--${kpi.tone}` : ''
                                    }`}
                                >
                                    {kpi.value}
                                </span>
                                <span className="qry__kpi-unit">{kpi.unit}</span>
                            </div>
                        </div>
                        <div className="qry__kpi-icon" aria-hidden="true">
                            <span className="material-symbols-outlined">{kpi.icon}</span>
                        </div>
                    </div>
                ))}
            </section>

            {/* ═════════ RAIL DE FILTROS ═════════ */}
            <section className="qry__filters">
                <div className="qry__filters-rail">
                    <div className="qry__filters-grid">
                        <Filters
                            table={selectedTable}
                            fields={fields}
                            values={draftFilters}
                            setFilters={setDraftFilters}
                        />
                    </div>
                    <div className="qry__filters-actions">
                        <button className="qry__btn--ghost" onClick={resetFilters}>
                            <span className="material-symbols-outlined">refresh</span>
                            Limpiar
                        </button>
                        <button className="qry__btn--apply" onClick={applyFilters}>
                            <span className="material-symbols-outlined">filter_alt</span>
                            Aplicar
                        </button>
                    </div>
                </div>

                {activeChips.length > 0 && (
                    <div className="qry__chips">
                        <span className="qry__chips-label">Filtros activos:</span>
                        {activeChips.map((chip) => (
                            <button
                                key={chip.key}
                                className="qry__chip qry__chip--accent"
                                onClick={() => removeFilter(chip.field, chip.op)}
                                title="Quitar filtro"
                            >
                                {chip.label}
                                <span className="qry__chip-remove" aria-hidden="true">
                                    ✕
                                </span>
                            </button>
                        ))}
                        <button className="qry__chip-reset" onClick={resetFilters}>
                            Restablecer todo
                        </button>
                    </div>
                )}
            </section>

            {/* ═════════ TABLA DE DATOS ═════════ */}
            <section className="qry__table-card">
                <div className="qry__table-headbar">
                    <div className="qry__table-title">
                        <h2>{tableDisplayName}</h2>
                        <span className="qry__table-count">
                            {totalRows} registro{totalRows === 1 ? '' : 's'}
                        </span>
                    </div>
                    <div className="qry__search">
                        <input
                            type="text"
                            placeholder={`Buscar en ${tableDisplayName.toLowerCase()}…`}
                            value={globalSearch}
                            onChange={(e) => {
                                setGlobalSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            aria-label={`Buscar en ${tableDisplayName}`}
                        />
                    </div>
                </div>

                <div className="qry__table-wrap">
                    <table className="qry__table">
                        <thead>
                            <tr>
                                <th aria-label="Número">#</th>
                                {fields.map(([header]) => (
                                    <th key={header}>{header}</th>
                                ))}
                                {profileBase && <th>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={fields.length + 2}>
                                        <div className="qry__loading">
                                            <span
                                                className="material-symbols-outlined"
                                                aria-hidden="true"
                                            >
                                                sync
                                            </span>
                                            Cargando padrón de {tableDisplayName}…
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={fields.length + 2}>
                                        <div className="qry__empty">
                                            No hay registros que coincidan con los criterios
                                            actuales.
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                paginatedData.map((row, index) => (
                                    <tr key={`${startIndex + index}-${row.id ?? index}`}>
                                        <td className="qry__cell-idx">
                                            {String(startIndex + index + 1).padStart(2, '0')}
                                        </td>
                                        {fields.map(([, field]) => (
                                            <td
                                                key={field}
                                                className={
                                                    numericFields.includes(field) &&
                                                    typeof row[field] === 'number'
                                                        ? 'qry__cell-num'
                                                        : ''
                                                }
                                            >
                                                {formatValue(row[field], field)}
                                            </td>
                                        ))}
                                        {profileBase && (
                                            <td>
                                                <Link
                                                    className="qry__row-link"
                                                    to={`${profileBase}${row.id}`}
                                                >
                                                    <span className="material-symbols-outlined">
                                                        open_in_new
                                                    </span>
                                                    Ver ficha
                                                </Link>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* ═════════ PAGINACIÓN ═════════ */}
                <div className="qry__pagination">
                    <div className="qry__pager-meta">
                        <span>
                            Mostrando{' '}
                            <strong>
                                {totalRows ? startIndex + 1 : 0}–
                                {startIndex + paginatedData.length} de {totalRows}
                            </strong>
                        </span>
                        <span>
                            <span className="qry__rows-label">Filas por pág.</span>{' '}
                            <select
                                className="qry__rows-select"
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                aria-label="Filas por página"
                            >
                                {[10, 25, 50].map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </span>
                    </div>
                    <div className="qry__pager" role="navigation" aria-label="Paginación">
                        <button
                            className="qry__pager-btn"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            ‹ Anterior
                        </button>
                        {pageNumbers.map((p, i) =>
                            p === '…' ? (
                                <span key={`gap-${i}`} className="qry__rows-label">
                                    …
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    className={`qry__pager-btn qry__pager-btn--num${
                                        p === currentPage ? ' qry__pager-btn--active' : ''
                                    }`}
                                    onClick={() => setCurrentPage(p)}
                                    aria-current={p === currentPage ? 'page' : undefined}
                                >
                                    {p}
                                </button>
                            )
                        )}
                        <button
                            className="qry__pager-btn"
                            onClick={() =>
                                setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                        >
                            Siguiente ›
                        </button>
                    </div>
                </div>
            </section>

            {/* ═════════ NOTA REGLAMENTARIA ═════════ */}
            <aside className="qry__notice">
                <div className="qry__notice-inner">
                    <div className="qry__notice-icon" aria-hidden="true">
                        <span className="material-symbols-outlined">info</span>
                    </div>
                    <div>
                        <h3>Nota Reglamentaria</h3>
                        <p>
                            Los datos publicados provienen del sistema oficial de gestión de
                            la liga y se actualizan con cada resultado registrado. Cualquier
                            discrepancia debe reportarse al departamento de estadística.{' '}
                            <em>Actualización: en tiempo real.</em>
                        </p>
                    </div>
                </div>
            </aside>

            <p className="qry__disclaimer">
                Padrón de datos públicos · LNBP — los perfiles y estadísticas individuales
                se verifican por serie y temporada vigente.
            </p>
        </div>
    );
};

export default Queries;