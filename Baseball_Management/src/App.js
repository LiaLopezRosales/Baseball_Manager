import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Sidebar from './components/sidebar';
import LoginBoard from './components/login';
import Modal from './components/Modal';
import AdminPage from './components/admin';  // Importa el componente de la página de administrador

import BaseballPlayerCRUD from './components/FormulariosCRUD/BaseballPlayerCRUD';
import BPParticipationCRUD from './components/FormulariosCRUD/BPParticipationCRUD';
import DirectionTeamCRUD from './components/FormulariosCRUD/DirectionTeamCRUD';
import GameCRUD from './components/FormulariosCRUD/GameCRUD';
import LineUpCRUD from './components/FormulariosCRUD/LineUpCRUD';
import PersonCRUD from './components/FormulariosCRUD/PersonCRUD';
import PitcherCRUD from './components/FormulariosCRUD/PitcherCRUD';
import PlayerInLineUpCRUD from './components/FormulariosCRUD/PlayerInLineUpCRUD';
import PlayerInPositionCRUD from './components/FormulariosCRUD/PlayerInPositionCRUD';
import PlayerSwapCRUD from './components/FormulariosCRUD/PlayerSwapCRUD';
import PositionCRUD from './components/FormulariosCRUD/PositionCRUD';
//import RolCRUD from './components/FormulariosCRUD/RolCRUD';
import ScoreCRUD from './components/FormulariosCRUD/ScoreCRUD';
import SeasonCRUD from './components/FormulariosCRUD/SeasonCRUD';
import SeriesCRUD from './components/FormulariosCRUD/SeriesCRUD';
import StarPlayerCRUD from './components/FormulariosCRUD/StarPlayerCRUD';
import TeamCRUD from './components/FormulariosCRUD/TeamCRUD';
import TeamOnTheFieldCRUD from './components/FormulariosCRUD/TeamOnTheFieldCRUD';
import TechnicalDirectorCRUD from './components/FormulariosCRUD/TechnicalDirectorCRUD';
import UserCRUD from './components/FormulariosCRUD/UserCRUD';
import WorkerCRUD from './components/FormulariosCRUD/WorkerCRUD';


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
                    {/*<p>{isLogged ? 'Welcome ' + userName : ''}</p>
                    <p>Rol Actual: {role}</p>*/}

                    <Sidebar role={role} onOptionSelect={handleOptionSelect} onModalOpen={handleModalOpen} />

                    <div className='content'>
                        {selectedOption === 'Posiciones' && < PositionCRUD />}
                        {selectedOption === 'Usuarios' && < UserCRUD />}
                        {selectedOption === 'Temporadas' && < SeasonCRUD/>}
                        {selectedOption === 'Trabajadores' && < WorkerCRUD/>}
                        {selectedOption === 'Equipos' && < TeamCRUD />}
                        {selectedOption === 'Alineaciones' && < LineUpCRUD />}
                        {selectedOption === 'Personas' && < PersonCRUD />}
                        {selectedOption === 'Jugadores' && < BaseballPlayerCRUD />}
                        {selectedOption === 'Directores Técnicos' && < TechnicalDirectorCRUD />}
                        {selectedOption === 'Jugadores en Alineación' && < PlayerInLineUpCRUD />}
                        {selectedOption === 'BP Participations' && < BPParticipationCRUD />}
                        {selectedOption === 'Equipos en el Campo' && < TeamOnTheFieldCRUD />}
                        {selectedOption === 'Puntuaciones' && < ScoreCRUD />}
                        {selectedOption === 'Juegos' && < GameCRUD />}
                        {selectedOption === 'Pitchers' && < PitcherCRUD />}
                        {selectedOption === 'Jugadores Estrella' && < StarPlayerCRUD />}
                        {selectedOption === 'Jugadores en Posición' && < PlayerInPositionCRUD />}
                        {selectedOption === 'Intercambios de Jugadores' && < PlayerSwapCRUD />}
                        {selectedOption === 'Series' && < SeriesCRUD />}
                        {selectedOption === 'Direction Team' && < DirectionTeamCRUD />}
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
                <Route path="/admin-dashboard" element={<AdminPage />} />
                {/* Define otras rutas aquí según sea necesario */}
            </Routes>
        </Router>
    );
}

export default App;
