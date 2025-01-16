import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/sidebar';  // Eliminé la importación de PlayerList
import LoginBoard from './components/login';
import Modal from './components/Modal';  // Importa el componente Modal
import PlayerList from './components/player_list';

function App() {
  const [isLogged, setLogin] = useState(false);
  const [userName, setUserName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);  // Estado para el Modal
  const [selectedOption, setSelectedOption] = useState(''); // Nuevo estado

  function handleClick() {
    setLogin(!isLogged);
  }

  const handleNameChange = (event) => {
    setUserName(event.target.value);
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

  return (
    <div className="App">
      <header className="App-header">
        <p>{isLogged ? 'Welcome ' + userName : ''}</p>

        <Sidebar onOptionSelect={handleOptionSelect} onModalOpen={handleModalOpen} /> {/* Pasar la función de selección de opciones y apertura del modal a Sidebar */}

        <div className='content'>
          {selectedOption === 'Player List' && <PlayerList logged={isLogged} />}
          {selectedOption === 'Other Option' && <p>Contenido para otra opción</p>}
          {/* Añadir más opciones aquí según sea necesario */}
        </div>

        <Modal isOpen={isModalOpen} onClose={handleModalClose}>
          <LoginBoard name={userName} isLogged={isLogged} onButtonClick={() => handleClick()} NameOnChange={handleNameChange} />
        </Modal>
      </header>
    </div>
  );
}

export default App;
