import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import Sidebar from './components/sidebar';
import LoginBoard from './components/login';
import Modal from './components/Modal';
import Landing from './components/Landing';
import { TeamProfile, PlayerProfile } from './components/profilePages';
import PlayerSwapForm from './components/PlayerSwapForm';
import PlayerSwapTable from './components/PlayerSwapTable';
import { CRUDRoute, ReportRoute, QueryRoute } from './viewRoutes';
import {
  toCRUDPath,
  toReportPath,
  toQueryPath,
  toSwapDefinePath,
  toSwapListPath,
} from './path';

// Componente interno que usa useNavigate (debe estar dentro del Router)
function AppRoutes({ role, team, onModalOpen }) {
  const navigate = useNavigate();

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

  return (
    <>
      <header className="App-header">
        <button className="mobile-menu-btn" aria-label="Abrir menú">
          <Menu size={20} />
        </button>

        <Sidebar role={role} onOptionSelect={handleOptionSelect} onModalOpen={onModalOpen} />

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
              <Route path="/admin/:slug" element={<CRUDRoute />} />
              <Route path="/reporte/:slug" element={<ReportRoute />} />
              <Route path="/consultas/:tabla" element={<QueryRoute />} />
              <Route path="/dt/cambios" element={<PlayerSwapForm teamId={team} />} />
              <Route path="/dt/listar-cambios" element={<PlayerSwapTable teamId={team} />} />
              <Route path="/equipo/:id" element={<TeamProfile />} />
              <Route path="/jugador/:id" element={<PlayerProfile />} />
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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

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
        <AppRoutes role={role} team={team} onModalOpen={handleModalOpen} />

        <Modal isOpen={isModalOpen} onClose={handleModalClose}>
          <LoginBoard
            name={userName}
            isLogged={isLogged}
            setLogin={setLogin}
            onButtonClick={handleClick}
            NameOnChange={handleNameChange}
            updateRole={updateRole}
            updateTeam={updateTeam}
          />
        </Modal>
      </div>
    </Router>
  );
}

export default App;
