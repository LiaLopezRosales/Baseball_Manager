import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronRight } from 'lucide-react';
import { ADMIN_NAV } from './adminNav';
import { toCRUDPath } from '../../path';

function AdminSidebar({ role, onLogout }) {
  const { pathname } = useLocation();

  return (
    <aside className="apn-sidebar">
      <div className="apn-sidebar__scroll">
        <div className="apn-sidebar__section">
          <span className="apn-sidebar__section-label">Formularios &amp; CRUD</span>
          <span className="apn-sidebar__count">{ADMIN_NAV.length}</span>
        </div>

        <nav className="apn-sidebar__nav" aria-label="Formularios & CRUD">
          {ADMIN_NAV.map((item) => {
            const path = toCRUDPath(item.option);
            const active = pathname === path;
            return (
              <Link
                key={item.option}
                to={path}
                className={`apn-sidebar__link${active ? ' apn-sidebar__link--active' : ''}`}
                title={item.label}
              >
                {active ? (
                  <>
                    <span className="apn-sidebar__dot" aria-hidden="true" />
                    <span className="apn-sidebar__label">{item.label}</span>
                    <span className="apn-sidebar__chip">ACTIVO</span>
                  </>
                ) : (
                  <>
                    <span className="apn-sidebar__label">{item.label}</span>
                    <ChevronRight size={16} className="apn-sidebar__chev" />
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="apn-sidebar__foot">
        <div className="apn-sidebar__card">
          <div className="apn-sidebar__card-head">
            <span className="apn-sidebar__card-title">
              <i className="apn-sidebar__live-dot" aria-hidden="true" />
              Licencia WBSC
            </span>
            <span className="apn-sidebar__card-year">2026</span>
          </div>
          <p className="apn-sidebar__card-sub">Sesión Activa - Nodo Oficial</p>
          <button className="apn-sidebar__logout" onClick={onLogout} title="Cerrar sesión">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;