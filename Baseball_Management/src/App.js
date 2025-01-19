import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Sidebar from './components/sidebar';
import LoginBoard from './components/login';
import Modal from './components/Modal';
import PlayerList from './components/player_list';
import AdminPage from './components/admin';  // Importa el componente de la página de administrador

function App() {
    const [isLogged, setLogin] = useState(false);
    const [userName, setUserName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);  
    const [selectedOption, setSelectedOption] = useState('');
    const [role, setRole] = useState('');

    const handleClick = () => {
        setLogin(!isLogged);
    };

    const handleNameChange = (newName) => {
        setUserName(newName);
    };

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    const handleModalOpen = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const updateRole = (newRole) => {
        setRole(newRole);
    };

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <p>{isLogged ? 'Welcome ' + userName : ''}</p>
                    <p>Rol Actual: {role}</p>

                    <Sidebar role={role} onOptionSelect={handleOptionSelect} onModalOpen={handleModalOpen} />

                    <div className='content'>
                        {selectedOption === 'Player List' && <PlayerList logged={isLogged} />}
                        {selectedOption === 'Posiciones' && <p>Contenido para Posiciones</p>}
                        {selectedOption === 'Usuarios' && <p>Contenido para Usuarios</p>}
                        {selectedOption === 'Temporadas' && <p>Contenido para Temporadas</p>}
                        {selectedOption === 'Trabajadores' && <p>Contenido para Trabajadores</p>}
                        {selectedOption === 'Equipos' && <p>Contenido para Equipos</p>}
                        {selectedOption === 'Alineaciones' && <p>Contenido para Alineaciones</p>}
                        {selectedOption === 'Personas' && <p>Contenido para Personas</p>}
                        {selectedOption === 'Jugadores' && <p>Contenido para Jugadores</p>}
                        {selectedOption === 'Directores Técnicos' && <p>Contenido para Directores Técnicos</p>}
                        {selectedOption === 'Jugadores en Alineación' && <p>Contenido para Jugadores en Alineación</p>}
                        {selectedOption === 'BP Participations' && <p>Contenido para BP Participations</p>}
                        {selectedOption === 'Equipos en el Campo' && <p>Contenido para Equipos en el Campo</p>}
                        {selectedOption === 'Puntuaciones' && <p>Contenido para Puntuaciones</p>}
                        {selectedOption === 'Juegos' && <p>Contenido para Juegos</p>}
                        {selectedOption === 'Pitchers' && <p>Contenido para Pitchers</p>}
                        {selectedOption === 'Jugadores Estrella' && <p>Contenido para Jugadores Estrella</p>}
                        {selectedOption === 'Jugadores en Posición' && <p>Contenido para Jugadores en Posición</p>}
                        {selectedOption === 'Intercambios de Jugadores' && <p>Contenido para Intercambios de Jugadores</p>}
                    </div>

                    <Modal isOpen={isModalOpen} onClose={handleModalClose}>
                        <LoginBoard o
                            name={userName} 
                            isLogged={isLogged} 
                            setLogin={setLogin} 
                            onButtonClick={handleClick} 
                            NameOnChange={handleNameChange} 
                            updateRole={updateRole} 
                        />
                    </Modal>
                </header>
            </div>

            <Routes>
                <Route path="/admin" element={<AdminPage />} />
                {/* Define otras rutas aquí según sea necesario */}
            </Routes>
        </Router>
    );
}

export default App;
