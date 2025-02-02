import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Sidebar from './components/sidebar';
import LoginBoard from './components/login';
import Modal from './components/Modal';
import AdminPage from './components/admin';
import MainPage from './components/main-page';
import ReportComponent from './components/report';
import PlayerSwapForm from './components/PlayerSwapForm';
import PlayerSwapTable from './components/PlayerSwapTable';
import Queries from './components/Queries';

// Importar formularios de Base de Datos
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
    const [selectedOption, setSelectedOption] = useState(() => {
        // Inicializa el estado con el valor de localStorage si existe
        const savedSelectedOption = localStorage.getItem('selectedOption') || '';
        return savedSelectedOption;
    });

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

        const savedSelectedOption = localStorage.getItem('selectedOption') || '';
        setSelectedOption(savedSelectedOption);
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

    // Estado para almacenar la tabla seleccionada en "Consultas"
    const [selectedTable, setSelectedTable] = useState('');

    // Función para manejar la selección de una opción
    const handleOptionSelect = (option, table = '') => {
        setSelectedOption(option);
        localStorage.setItem('selectedOption', option); // Guarda la opción seleccionada en localStorage
        setSelectedTable(table); // Actualizamos la tabla seleccionada si se proporciona
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
                        <Route exact path='/' element={selectedOption === "" && <MainPage />}/>
                        <Route path="/admin-dashboard" element={<AdminPage />} />
                        {/* Define otras rutas aquí según sea necesario */}
                    </Routes>

                    {/* Botones del sidebar */}
                    <div className='content'>
                        {selectedOption === 'Main' && < MainPage />}
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
                        {selectedOption === 'Equipos ganadores y directores técnicos por temporadas' && <ReportComponent report_id={0} report_name={selectedOption} />}
                        {selectedOption === 'Jugadores estrellas' && <ReportComponent report_id={1} report_name={selectedOption} />}
                        {selectedOption === 'Primer y último lugar' && <ReportComponent report_id={2} report_name={selectedOption} />}
                        {selectedOption === 'Series con más/menos juegos celebrados' && <ReportComponent report_id={3} report_name={selectedOption} />}
                        {selectedOption === 'Carreras limpias/juegos ganados' && <ReportComponent report_id={4} report_name={selectedOption}  />}
                        {selectedOption === 'Average' && <ReportComponent report_id={5} report_name={selectedOption} />}
                        {selectedOption === 'Estadísticas de juegos por equipos' && <ReportComponent report_id={6} report_name={selectedOption} />}
                        {selectedOption === 'Efectividad por posición' && <ReportComponent report_id={7} report_name={selectedOption} />}
                        {selectedOption === 'Jugadores de un equipo' && <ReportComponent report_id={8} report_name={selectedOption} />}
                        {selectedOption === 'Definir Cambios' && <PlayerSwapForm teamId={team} />}
                        {selectedOption === 'Listar Cambios' && <PlayerSwapTable teamId={team} />}
                        {selectedOption === 'Qy' && <Queries selectedTable={selectedTable}/>}
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