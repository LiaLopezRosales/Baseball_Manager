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
                        {selectedOption === 'Other Option' && <p>Contenido para otra opción</p>}
                    </div>

                    <Modal isOpen={isModalOpen} onClose={handleModalClose}>
                        <LoginBoard 
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
