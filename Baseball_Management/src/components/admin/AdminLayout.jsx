import React, { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import LandingHeader from '../landing/LandingHeader';
import AdminSidebar from './AdminSidebar';
import { CRUDRoute } from '../../viewRoutes';
import { CRUD_ROUTES } from '../../routes';
import { ADMIN_NAV } from './adminNav';
import { getInitialTheme, applyTheme } from '../../theme';
import './adminPanel.css';

function StatusChips() {
  return (
    <div className="apn-chips">
      <span className="apn-chip apn-chip--sync">
        <i className="apn-chip__dot" aria-hidden="true" /> WBSC SYNC
      </span>
      <span className="apn-chip-sep">|</span>
      <span className="apn-chip apn-chip--lock">TLS 1.3 DB SEGURA</span>
      <span className="apn-chip-sep">|</span>
      <span className="apn-chip apn-chip--node">NODO FED-01</span>
    </div>
  );
}

function Crumb({ option }) {
  const slug = Object.keys(CRUD_ROUTES).find((k) => CRUD_ROUTES[k] === option);
  return (
    <nav className="apn-crumb" aria-label="Miga de pan">
      <span className="apn-crumb__current">Módulo Federativo</span>
      <span className="apn-crumb__sep">/</span>
      <span className="apn-crumb__current">Panel Administrativo</span>
      <span className="apn-crumb__sep">/</span>
      <strong className="apn-crumb__leaf">
        {option} <span className="apn-crumb__tag">(CRUD)</span>
        {slug ? <span className="apn-crumb__slug"> · /{slug}</span> : null}
      </strong>
    </nav>
  );
}

function AdminLayout({
  isLogged,
  userName,
  role,
  onModalOpen,
  onRegisterOpen,
  onLogout,
}) {
  const { slug } = useParams();
  const [theme, setTheme] = useState(() => getInitialTheme());
  const apnRef = useRef(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const apn = apnRef.current;
    const el = apn?.querySelector('.landing__nav');
    if (!apn || !el) return;
    const update = () => {
      apn.style.setProperty('--apn-header-h', `${el.getBoundingClientRect().height}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!slug || !CRUD_ROUTES[slug]) {
    return <Navigate to="/admin/personas" replace />;
  }

  const option = CRUD_ROUTES[slug];
  const navItem = ADMIN_NAV.find((n) => n.option === option);

  return (
    <div className="apn" data-theme={theme} ref={apnRef}>
      <LandingHeader
        isLogged={isLogged}
        userName={userName}
        role={role}
        onModalOpen={onModalOpen}
        onRegisterOpen={onRegisterOpen}
        onLogout={onLogout}
        theme={theme}
        onThemeChange={setTheme}
        onNameChange={() => {}}
      />

      <div className="apn__shell">
        <AdminSidebar role={role} onLogout={onLogout} />

        <main className="apn__main">
          <div className="apn__topbar">
            <Crumb option={navItem?.label || option} />
            <StatusChips />
          </div>

          <div className="apn__content">
            <CRUDRoute />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;