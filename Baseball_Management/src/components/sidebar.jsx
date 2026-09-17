import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Home,
  Database,
  BarChart3,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Settings,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import Logo from '../logo.jpg';
import { getInitialTheme, applyTheme } from '../theme';
import { REPORT_ROUTES } from '../routes';
import NotificationBell from './NotificationBell';
import './sidebar.css';

const CONSULTAS = [
  { value: 'Team', label: 'Equipos' },
  { value: 'Game', label: 'Juegos' },
  { value: 'Series', label: 'Series' },
  { value: 'Worker', label: 'Trabajadores' },
  { value: 'DirectionTeam', label: 'Equipos de Dirección' },
  { value: 'BaseballPlayer', label: 'Jugadores de Baseball' },
  { value: 'Season', label: 'Temporadas' },
  { value: 'Pitcher', label: 'Pitchers' },
  { value: 'TeamOnTheField', label: 'Equipo en Campo' },
  { value: 'StarPlayer', label: 'Jugador Estrella' },
  { value: 'PlayerInPosition', label: 'Jugadores en Posición' },
  { value: 'Score', label: 'Puntuaciones' },
  { value: 'BPParticipation', label: 'Participación de los Jugadores' },
  { value: 'PlayerSwap', label: 'Cambio de Jugador' },
  { value: 'PlayerInLineUp', label: 'Jugadores en Alineación' },
];

const REPORTS = [
  'Equipos ganadores y directores técnicos por temporadas',
  'Jugadores estrellas',
  'Primer y último lugar',
  'Series con más/menos juegos celebrados',
  'Carreras limpias/juegos ganados',
  'Average',
  'Estadísticas de juegos por equipos',
  'Efectividad por posición',
  'Jugadores de un equipo',
];

function Sidebar({ role, onOptionSelect, onModalOpen, onLogout }) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showReports, setShowReports] = useState(() => pathname.startsWith('/reporte'));
  const [showQueries, setShowQueries] = useState(() => pathname.startsWith('/consultas'));
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const reportSlugs = useMemo(() => Object.keys(REPORT_ROUTES), []);

  const isActive = (path) => pathname === path || (pathname.startsWith(path) && path !== '/');
  const isReportActive = (slug) => pathname === `/reporte/${slug}`;
  const isQueryActive = (table) => pathname === `/consultas/${table}`;

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      document.body.classList.toggle('sidebar-collapsed', next);
      return next;
    });
  };
  const handleReportsClick = () => setShowReports((s) => !s);
  const handleQueriesClick = () => setShowQueries((s) => !s);
  const handleQuerySelect = (table) => onOptionSelect('Qy', table);

  const BranchIcon = ({ isOpen }) =>
    isOpen ? (
      <ChevronDown size={16} className="sidebar__chevron" />
    ) : (
      <ChevronRight size={16} className="sidebar__chevron" />
    );

  return (
    <div className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar__top">
        <div className="sidebar__brand">
          <img src={Logo} alt="Logo" className="sidebar__logo" />
          {!collapsed && (
            <span className="sidebar__brand-name">Baseball Manager</span>
          )}
        </div>

        <button
          className="sidebar__collapse-btn"
          onClick={toggleCollapse}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <button
          className="sidebar__collapse-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {role && role !== 'Guest' && <NotificationBell />}
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          <li
            className={`sidebar__item${isActive('/') ? ' sidebar__item--active' : ''}`}
            onClick={() => onOptionSelect('Main')}
            title="Inicio"
          >
            <Home size={20} className="sidebar__icon" />
            {!collapsed && <span className="sidebar__label">Inicio</span>}
          </li>

          {/* Consultas */}
          <li
            className={`sidebar__item sidebar__item--group${pathname.startsWith('/consultas') ? ' sidebar__item--active' : ''}`}
            onClick={handleQueriesClick}
            title="Consultas"
          >
            <Database size={20} className="sidebar__icon" />
            {!collapsed && <span className="sidebar__label">Consultas</span>}
            {!collapsed && <BranchIcon isOpen={showQueries} />}
          </li>

          {showQueries && !collapsed && (
            <ul className="sidebar__sublist">
              {CONSULTAS.map((c) => (
                <li
                  key={c.value}
                  className={`sidebar__subitem${isQueryActive(c.value) ? ' sidebar__subitem--active' : ''}`}
                  title={c.label}
                  onClick={() => handleQuerySelect(c.value)}
                >
                  <span className="sidebar__sub-dot" />
                  {c.label}
                </li>
              ))}
            </ul>
          )}

          {/* Estadísticas */}
          <li
            className={`sidebar__item sidebar__item--group${pathname.startsWith('/reporte') ? ' sidebar__item--active' : ''}`}
            onClick={handleReportsClick}
            title="Estadísticas"
          >
            <BarChart3 size={20} className="sidebar__icon" />
            {!collapsed && <span className="sidebar__label">Estadísticas</span>}
            {!collapsed && <BranchIcon isOpen={showReports} />}
          </li>

          {showReports && !collapsed && (
            <ul className="sidebar__sublist">
              {REPORTS.map((r, i) => (
                <li
                  key={r}
                  className={`sidebar__subitem${isReportActive(reportSlugs[i]) ? ' sidebar__subitem--active' : ''}`}
                  title={r}
                  onClick={() => onOptionSelect(r)}
                >
                  <span className="sidebar__sub-dot" />
                  {r}
                </li>
              ))}
            </ul>
          )}

          {/* Panel Administrativo (standalone) */}
          {role === 'Admin' && (
            <li
              className={`sidebar__item${pathname.startsWith('/admin') ? ' sidebar__item--active' : ''}`}
              onClick={() => onOptionSelect('Personas')}
              title="Panel Administrativo"
            >
              <Settings size={20} className="sidebar__icon" />
              {!collapsed && <span className="sidebar__label">Panel Administrativo</span>}
            </li>
          )}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button
          className="sidebar__account"
          onClick={onModalOpen}
          title="Cuenta"
        >
          <span className="sidebar__avatar">
            <User size={18} />
          </span>
          {!collapsed && (
            <span className="sidebar__account-text">
              <span className="sidebar__account-name">Cuenta</span>
              <span className="sidebar__account-role">{role || 'Invitado'}</span>
            </span>
          )}
        </button>

        {role && role !== 'Guest' ? (
          <button
            className="sidebar__logout"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            <LogOut size={18} className="sidebar__icon" />
            {!collapsed && <span className="sidebar__label">Cerrar sesión</span>}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default Sidebar;
