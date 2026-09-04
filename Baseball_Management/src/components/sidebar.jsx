import React, { useState, useEffect } from 'react';
import {
  Home,
  Database,
  BarChart3,
  GitCompare,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  FolderOpen,
  User,
  LayoutGrid,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import Logo from '../logo.jpg';
import { getInitialTheme, applyTheme } from '../theme';
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

const ADMIN_FORMS = [
  { option: 'Usuarios', label: 'Usuarios' },
  { option: 'Personas', label: 'Personas' },
  { option: 'Trabajadores', label: 'Trabajadores' },
  { option: 'Jugadores', label: 'Jugadores' },
  { option: 'Pitchers', label: 'Lanzadores' },
  { option: 'Direction Team', label: 'Equipos de Dirección' },
  { option: 'Directores Técnicos', label: 'Directores Técnicos' },
  { option: 'Temporadas', label: 'Temporadas' },
  { option: 'Series', label: 'Series' },
  { option: 'Juegos', label: 'Juegos' },
  { option: 'Puntuaciones', label: 'Marcadores' },
  { option: 'Equipos', label: 'Equipos' },
  { option: 'Alineaciones', label: 'Alineaciones' },
  { option: 'Jugadores en Alineación', label: 'Jugadores en Alineación' },
  { option: 'Intercambios de Jugadores', label: 'Cambios de Jugador' },
  { option: 'Equipos en el Campo', label: 'Equipos en el Campo' },
  { option: 'BP Participations', label: 'Participación de Jugadores' },
  { option: 'Posiciones', label: 'Posiciones' },
  { option: 'Jugadores en Posición', label: 'Jugadores en Posición' },
  { option: 'Jugadores Estrella', label: 'Jugadores Estrella' },
];

function Sidebar({ role, onOptionSelect, onModalOpen, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showForms, setShowForms] = useState(false);
  const [showQueries, setShowQueries] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      document.body.classList.toggle('sidebar-collapsed', next);
      return next;
    });
  };
  const handleReportsClick = () => setShowReports((s) => !s);
  const handleFormsClick = () => setShowForms((s) => !s);
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
            className="sidebar__item"
            onClick={() => onOptionSelect('Main')}
            title="Inicio"
          >
            <Home size={20} className="sidebar__icon" />
            {!collapsed && <span className="sidebar__label">Inicio</span>}
          </li>

          <li
            className="sidebar__item"
            onClick={() => onOptionSelect('Comparar Jugadores')}
            title="Comparar jugadores"
          >
            <GitCompare size={20} className="sidebar__icon" />
            {!collapsed && <span className="sidebar__label">Comparar jugadores</span>}
          </li>

          {/* Consultas */}
          <li
            className="sidebar__item sidebar__item--group"
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
                  className="sidebar__subitem"
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
            className="sidebar__item sidebar__item--group"
            onClick={handleReportsClick}
            title="Estadísticas"
          >
            <BarChart3 size={20} className="sidebar__icon" />
            {!collapsed && <span className="sidebar__label">Estadísticas</span>}
            {!collapsed && <BranchIcon isOpen={showReports} />}
          </li>

          {showReports && !collapsed && (
            <ul className="sidebar__sublist">
              {REPORTS.map((r) => (
                <li
                  key={r}
                  className="sidebar__subitem"
                  title={r}
                  onClick={() => onOptionSelect(r)}
                >
                  <span className="sidebar__sub-dot" />
                  {r}
                </li>
              ))}
            </ul>
          )}

          {/* Formularios */}
          {role === 'Admin' && (
            <>
              <li
                className="sidebar__item sidebar__item--group"
                onClick={handleFormsClick}
                title="Formularios"
              >
                <FolderOpen size={20} className="sidebar__icon" />
                {!collapsed && <span className="sidebar__label">Formularios</span>}
                {!collapsed && <BranchIcon isOpen={showForms} />}
              </li>

              {showForms && !collapsed && (
                <ul className="sidebar__sublist">
                  {ADMIN_FORMS.map((f) => (
                    <li
                      key={f.option}
                      className="sidebar__subitem"
                      title={f.label}
                      onClick={() => onOptionSelect(f.option)}
                    >
                      <span className="sidebar__sub-dot" />
                      {f.label}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {role === 'Director Técnico' && (
            <>
              <li
                className="sidebar__item sidebar__item--group"
                onClick={handleFormsClick}
                title="Alineaciones"
              >
                <LayoutGrid size={20} className="sidebar__icon" />
                {!collapsed && (
                  <span className="sidebar__label">Alineaciones</span>
                )}
                {!collapsed && <BranchIcon isOpen={showForms} />}
              </li>

              {showForms && !collapsed && (
                <ul className="sidebar__sublist">
                  <li
                    className="sidebar__subitem"
                    onClick={() => onOptionSelect('Definir Cambios')}
                  >
                    <span className="sidebar__sub-dot" />
                    Establecer Cambios
                  </li>
                  <li
                    className="sidebar__subitem"
                    onClick={() => onOptionSelect('Listar Cambios')}
                  >
                    <span className="sidebar__sub-dot" />
                    Mostrar Cambios
                  </li>
                </ul>
              )}
            </>
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
