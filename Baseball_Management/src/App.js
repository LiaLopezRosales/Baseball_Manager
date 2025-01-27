import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Sidebar from './components/sidebar';
import LoginBoard from './components/login';
import Modal from './components/Modal';
import AdminPage from './components/admin';
import MainPage from './components/main-page';
import ReportComponent from './components/report';

//Importar formularios de Base de Datos
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
// import RolCRUD from './components/FormulariosCRUD/RolCRUD';
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
    // Estado para verificar si el usuario está logged in
    const [isLogged, setLogin] = useState(() => {
        // Inicializa el estado con el valor de localStorage si existe
        const savedIsLogged = localStorage.getItem('isLogged');
        return savedIsLogged === 'true';
    });
    
    // Estado para almacenar el nombre del usuario
    const [userName, setUserName] = useState('');

    // Estado para controlar si el modal está abierto
    const [isModalOpen, setIsModalOpen] = useState(false);  

    // Estado para seleccionar la opción actual
    const [selectedOption, setSelectedOption] = useState('');

    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedPitcher, setSelectedPitcher] = useState('');
    const [selectedSeason, setSelectedSeason] = useState('');

    // Estado para almacenar el rol del usuario
    const [role, setRole] = useState(() => {
        // Inicializa el estado con el valor de localStorage si existe
        const savedRole = localStorage.getItem('role') || '';
        return savedRole;
    });   
    
    // Estado para almacenar el equipo actual (inicializado como null)
    const [team, setTeam] = useState(() => {
        // Inicializa el estado con el valor de localStorage si existe
        const savedTeam = localStorage.getItem('team');
        return savedTeam ? JSON.parse(savedTeam) : null;
    });

    useEffect(() => {
        // Al montar el componente, actualiza los estados con los valores de localStorage
        const loggedStatus = localStorage.getItem('isLogged') === 'true';
        setLogin(loggedStatus);

        const savedRole = localStorage.getItem('role') || '';
        setRole(savedRole);
    }, []);

    // Función para cambiar el estado de logged in
    const handleClick = () => {
        setLogin(!isLogged);
        localStorage.setItem('isLogged', !isLogged);
    };

    // Función para actualizar el nombre del usuario
    const handleNameChange = (newName) => {
        setUserName(newName);
    };

    // Función para seleccionar una opción
    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    // Funciones para controlar el estado del modal
    const handleModalOpen = () => {
        setIsModalOpen(true);
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    // Función para actualizar el rol del usuario
    const updateRole = (newRole) => {
        setRole(newRole);
        localStorage.setItem('role', newRole);
    };

    // Función para actualizar el equipo actual
    const updateTeam = (newTeam) => {
        setTeam(newTeam);
        localStorage.setItem('team', JSON.stringify(newTeam));
    };

    const handleTeamChange = (event) => {
        setSelectedTeam(event.target.value);
    };

    const handlePitcherChange = (event) => {
        setSelectedPitcher(event.target.value);
    };

    const handleSeasonChange = (event) => {
        setSelectedSeason(event.target.value);
    };

    // Renderiza la interfaz de la aplicación
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    {/*<p>{isLogged ? 'Logged In' : 'Logged Out'}</p>
                    <p>{isLogged ? 'Welcome ' + userName : ''}</p>
                    <p>Rol Actual: {role}</p>*/}

                    <Sidebar role={role} onOptionSelect={handleOptionSelect} onModalOpen={handleModalOpen} />

                    <Routes>
                        <Route exact path='/' element={<MainPage onTeamChange={handleTeamChange} onPitcherChange={handlePitcherChange} onSeasonChange={handleSeasonChange}/>}/>
                        <Route path="/admin-dashboard" element={<AdminPage />} />
                        {/* Define otras rutas aquí según sea necesario */}
                    </Routes>

                    {/* Botones del sidebar */}
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
                        {selectedOption === 'Winners' && <ReportComponent report_id={0} season_id={selectedSeason}/>}
                        {selectedOption === 'Star Players' && <ReportComponent report_id={1} season_id={selectedSeason}/>}
                        {selectedOption === 'First and Last' && <ReportComponent report_id={2} season_id={selectedSeason}/>}
                        {selectedOption === 'Plays per Series' && <ReportComponent report_id={3}/>}
                        {selectedOption === 'PitcherStats' && <ReportComponent report_id={4} pitcher_id={selectedPitcher}/>}
                        {selectedOption === 'Average' && <ReportComponent report_id={5}/>}
                        {selectedOption === 'Stats' && <ReportComponent report_id={6}/>}
                        {selectedOption === 'Efectividad' && <ReportComponent report_id={7}/>}
                        {selectedOption === 'TeamPlayers' && <ReportComponent report_id={8} team_id={selectedTeam}/>}
                    </div>

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
                </header>
            </div>

        </Router>
    );
}

export default App;

