import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import Sidebar from './components/sidebar';
import LoginBoard from './components/login';
import Modal from './components/Modal';
import Landing from './components/Landing';
import PublicDataLayout from './components/landing/PublicDataLayout';
import RegisterBoard from './components/Register';
import { TeamProfile, PlayerProfile } from './components/profilePages';
import PlayerCompare from './components/PlayerCompare';
import ProtectedRoute from './components/ProtectedRoute';
import PlayerSwapForm from './components/PlayerSwapForm';
import PlayerSwapTable from './components/PlayerSwapTable';
import { CRUDRoute, ReportRoute, QueryRoute } from './viewRoutes';
import {
  toCRUDPath,
  toReportPath,
  toQueryPath,
  toSwapDefinePath,
  toSwapListPath,
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
function AppRoutes({ role, team, isLogged, onModalOpen, onRegisterOpen, onLogout }) {
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
    if (option === 'Definir Cambios') {
      navigate(toSwapDefinePath());
      return;
    }
    if (option === 'Listar Cambios') {
      navigate(toSwapListPath());
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
  ) : !isLogged && location.pathname.startsWith('/consultas') ? (
    <PublicDataLayout
      onModalOpen={onModalOpen}
      onRegisterOpen={onRegisterOpen}
      onLogout={onLogout}
    />
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
              <Route path="/admin/:slug" element={<ProtectedRoute roles={['Admin']}><CRUDRoute /></ProtectedRoute>} />
              <Route path="/reporte/:slug" element={<ReportRoute />} />
              <Route path="/consultas/:tabla" element={<QueryRoute />} />
              <Route path="/dt/cambios" element={<ProtectedRoute roles={['Director Técnico']}><PlayerSwapForm teamId={team} /></ProtectedRoute>} />
              <Route path="/dt/listar-cambios" element={<ProtectedRoute roles={['Director Técnico']}><PlayerSwapTable teamId={team} /></ProtectedRoute>} />
              <Route path="/equipo/:id" element={<TeamProfile />} />
              <Route path="/jugador/:id" element={<PlayerProfile />} />
              <Route path="/comparar" element={<ProtectedRoute roles={['Admin', 'Director Técnico', 'Usuario General']}><PlayerCompare /></ProtectedRoute>} />
              <Route path="*" element={<Landing />} />
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
