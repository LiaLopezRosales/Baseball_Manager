import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import Sidebar from './components/sidebar';
import LoginBoard from './components/login';
import Modal from './components/Modal';
import Landing from './components/Landing';
import ConsultasLayout from './components/landing/ConsultasLayout';
import EstadisticasLayout from './components/landing/EstadisticasLayout';
import RegisterBoard from './components/Register';
import { TeamProfile, PlayerProfile } from './components/profilePages';
import PlayerCompare from './components/PlayerCompare';
import ProtectedRoute from './components/ProtectedRoute';
import DtPanel from './components/dt/DtPanel';
import DtHistorial from './components/dt/DtHistorial';
import AdminLayout from './components/admin/AdminLayout';
import {
  toCRUDPath,
  toReportPath,
  toQueryPath,
  toComparePath,
} from './path';

// El registro ya no es una página: navegar a /registro abre el modal y vuelve al inicio
function RegisterRedirect({ onOpen }) {
  const navigate = useNavigate();
  useEffect(() => {
    onOpen?.();
    navigate('/', { replace: true });
  }, [onOpen, navigate]);
  return null;
}

// Componente interno que usa useNavigate (debe estar dentro del Router)
function AppRoutes({ role, team, isLogged, userName, onModalOpen, onRegisterOpen, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname === '/';

  const handleOptionSelect = (option, table = '') => {
    if (option === 'Main') {
      navigate('/');
      return;
    }
    if (option === 'Qy') {
      navigate(toQueryPath(table));
      return;
    }
    if (option === 'Comparar Jugadores') {
      navigate(toComparePath());
      return;
    }
    const reportPath = toReportPath(option);
    if (reportPath !== '/') {
      navigate(reportPath);
      return;
    }
    const crudPath = toCRUDPath(option);
    if (crudPath !== '/') {
      navigate(crudPath);
      return;
    }
    navigate('/');
  };

  return isStandalone ? (
    <Landing
      isLogged={isLogged}
      role={role}
      onModalOpen={onModalOpen}
      onRegisterOpen={onRegisterOpen}
      onLogout={onLogout}
    />
  ) : location.pathname.startsWith('/consultas') ? (
    <ConsultasLayout
      isLogged={isLogged}
      userName={userName}
      role={role}
      onModalOpen={onModalOpen}
      onRegisterOpen={onRegisterOpen}
      onLogout={onLogout}
    />
  ) : location.pathname.startsWith('/reporte') ? (
    <EstadisticasLayout
      isLogged={isLogged}
      userName={userName}
      role={role}
      onModalOpen={onModalOpen}
      onRegisterOpen={onRegisterOpen}
      onLogout={onLogout}
    />
  ) : location.pathname.startsWith('/jugador') ? (
    <Routes>
      <Route
        path="/jugador/:id"
        element={
          <PlayerProfile
            isLogged={isLogged}
            userName={userName}
            role={role}
            onModalOpen={onModalOpen}
            onRegisterOpen={onRegisterOpen}
            onLogout={onLogout}
          />
        }
      />
    </Routes>
  ) : location.pathname.startsWith('/equipo') ? (
    <Routes>
      <Route
        path="/equipo/:id"
        element={
          <TeamProfile
            isLogged={isLogged}
            userName={userName}
            role={role}
            onModalOpen={onModalOpen}
            onRegisterOpen={onRegisterOpen}
            onLogout={onLogout}
          />
        }
      />
    </Routes>
  ) : location.pathname.startsWith('/comparar') ? (
    <ProtectedRoute roles={['Admin', 'Director Técnico', 'Usuario General']}>
      <PlayerCompare
        isLogged={isLogged}
        userName={userName}
        role={role}
        onModalOpen={onModalOpen}
        onRegisterOpen={onRegisterOpen}
        onLogout={onLogout}
      />
    </ProtectedRoute>
  ) : location.pathname.startsWith('/admin') ? (
    <Routes>
      <Route
        path="/admin/:slug"
        element={
          <ProtectedRoute roles={['Admin']}>
            <AdminLayout
              isLogged={isLogged}
              userName={userName}
              role={role}
              onModalOpen={onModalOpen}
              onRegisterOpen={onRegisterOpen}
              onLogout={onLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/personas" replace />} />
    </Routes>
) : location.pathname.startsWith('/dt') ? (
    <ProtectedRoute roles={['Director Técnico']}>
      <Routes>
        <Route
          path="/dt/cambios"
          element={
            <DtPanel
              teamId={team}
              isLogged={isLogged}
              userName={userName}
              role={role}
              onModalOpen={onModalOpen}
              onRegisterOpen={onRegisterOpen}
              onLogout={onLogout}
            />
          }
        />
        <Route
          path="/dt/listar-cambios"
          element={
            <DtHistorial
              teamId={team}
              isLogged={isLogged}
              userName={userName}
              role={role}
              onModalOpen={onModalOpen}
              onRegisterOpen={onRegisterOpen}
              onLogout={onLogout}
            />
          }
        />
        <Route path="/dt/*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProtectedRoute>
  ) : (
    <>
      <header className="App-header">
        <button className="mobile-menu-btn" aria-label="Abrir menú">
          <Menu size={20} />
        </button>

        <Sidebar role={role} onOptionSelect={handleOptionSelect} onModalOpen={onModalOpen} onLogout={onLogout} />

        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            className="content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/registro" element={<RegisterRedirect onOpen={onRegisterOpen} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </header>
    </>
  );
}

function App() {
  const [isLogged, setLogin] = useState(() => localStorage.getItem('isLogged') === 'true');
  const [userName, setUserName] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'login' | 'register' | null
  const [role, setRole] = useState(() => localStorage.getItem('role') || '');
  const [team, setTeam] = useState(() => {
    const savedTeam = localStorage.getItem('team');
    return savedTeam ? JSON.parse(savedTeam) : null;
  });

  useEffect(() => {
    setLogin(localStorage.getItem('isLogged') === 'true');
    setRole(localStorage.getItem('role') || '');
  }, []);

  const handleClick = () => {
    setLogin((l) => {
      const next = !l;
      localStorage.setItem('isLogged', next);
      return next;
    });
  };

  const handleNameChange = (newName) => setUserName(newName);

  const handleModalOpen = () => setModalMode('login');
  const handleRegisterOpen = () => setModalMode('register');
  const handleModalClose = () => setModalMode(null);

  const handleLogout = () => {
    localStorage.clear();
    setLogin(false);
    setRole('');
    setTeam(null);
    setUserName('');
    setModalMode(null);
    window.location.reload();
  };

  const updateRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('role', newRole);
  };

  const updateTeam = (newTeam) => {
    setTeam(newTeam);
    localStorage.setItem('team', JSON.stringify(newTeam));
  };

  return (
    <Router>
      <div className="App">
        <AppRoutes
          role={role}
          team={team}
          isLogged={isLogged}
          userName={userName}
          onModalOpen={handleModalOpen}
          onRegisterOpen={handleRegisterOpen}
          onLogout={handleLogout}
        />

        <Modal isOpen={modalMode !== null} onClose={handleModalClose}>
          {modalMode === 'register' ? (
            <RegisterBoard
              setLogin={setLogin}
              updateRole={updateRole}
              updateTeam={updateTeam}
              NameOnChange={handleNameChange}
              onClose={handleModalClose}
              onSwitchToLogin={handleModalOpen}
            />
          ) : (
            <LoginBoard
              name={userName}
              isLogged={isLogged}
              setLogin={setLogin}
              onButtonClick={handleClick}
              NameOnChange={handleNameChange}
              updateRole={updateRole}
              updateTeam={updateTeam}
              onSwitchToRegister={handleRegisterOpen}
            />
          )}
        </Modal>
      </div>
    </Router>
  );
}

export default App;
