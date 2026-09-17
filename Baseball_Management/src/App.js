import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './App.css';
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
import InfoPage from './components/infoPages/InfoPage';
import AltasBajasPage from './components/infoPages/AltasBajasPage';
import { INFO_PAGES } from './components/infoPages/infoContent';
import { AuthModalContext } from './authModal';
import { clearSession } from './session';

// El registro ya no es una página: navegar a /registro abre el modal y vuelve al inicio.
// Con sesión activa no tiene sentido abrir el registro: solo redirige al inicio.
function RegisterRedirect({ onOpen, isLogged }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLogged) onOpen?.();
    navigate('/', { replace: true });
  }, [onOpen, navigate, isLogged]);
  return null;
}

// Componente interno que usa useNavigate (debe estar dentro del Router)
function AppRoutes({ role, team, isLogged, userName, onModalOpen, onRegisterOpen, onLogout }) {
  const location = useLocation();
  const isStandalone = location.pathname === '/';
  const infoContent = INFO_PAGES[location.pathname];

  return isStandalone ? (
    <Landing
      isLogged={isLogged}
      userName={userName}
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
  ) : location.pathname === '/altas-bajas' ? (
    <AltasBajasPage
      isLogged={isLogged}
      userName={userName}
      role={role}
      onModalOpen={onModalOpen}
      onRegisterOpen={onRegisterOpen}
      onLogout={onLogout}
    />
  ) : infoContent ? (
    <InfoPage
      content={infoContent}
      isLogged={isLogged}
      userName={userName}
      role={role}
      onModalOpen={onModalOpen}
      onRegisterOpen={onRegisterOpen}
      onLogout={onLogout}
    />
  ) : (
    <Routes>
      <Route path="/registro" element={<RegisterRedirect onOpen={onRegisterOpen} isLogged={isLogged} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [isLogged, setLogin] = useState(() => localStorage.getItem('isLogged') === 'true');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
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
    clearSession();
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
        <AuthModalContext.Provider value={{ openLogin: handleModalOpen, openRegister: handleRegisterOpen }}>
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
        </AuthModalContext.Provider>
      </div>
    </Router>
  );
}

export default App;
