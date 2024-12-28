// import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import PlayerList from './components/player_list';
import Sidebar from './components/sidebar';
import LoginBoard from './components/login';

function App() {
  const [isLogged, setLogin] = useState( false );
  const [userName, setUserName] = useState("");
  const [show, setShow] = useState( true );

  function handleClick() {
    setLogin(!isLogged)
  }

  const handleNameChange = (event) => {
    setUserName(event.target.value)
  }


  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
        
        <div className='login'>
          <button onClick={() => { setShow(!show) }}>Account</button>
        </div>

        <p>{isLogged ? 'Welcome ' + userName : ''}</p>

        {show ? (
        <PlayerList logged={isLogged}/>
        ) : (
        <LoginBoard name={userName} isLogged={isLogged} onButtonClick = {() => handleClick()} NameOnChange={handleNameChange}/>
        )}

        <Sidebar />
      
        </header>
    </div>
  );
}

export default App;

// export default () => {
//   const [show, setShow] = useState(true);

//   return (
//     <>
//       <button
//         type="button"
//         onClick={() => {
//           setShow(!show);
//         }}
//       >
//         Mostrar {show ? 'Div 2' : 'Div 1'}
//       </button>

//       {show ? (
//         <div style={{ color: 'red' }}>Div 1</div>
//       ) : (
//         <div style={{ color: 'blue' }}>Div 2</div>
//       )}
//     </>
//   );
// };