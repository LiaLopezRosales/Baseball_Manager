import React from 'react';
import './sidebar.css';

function Sidebar({ role, onOptionSelect, onModalOpen }) {
  return (
    <div className='sidebar'>
      <div className='sidebar-content'>
        <ul>
          {role === 'Admin' && <li onClick={() => onOptionSelect('Posiciones')}>Posiciones</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Usuarios')}>Usuarios</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Temporadas')}>Temporadas</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Trabajadores')}>Trabajadores</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Equipos')}>Equipos</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Alineaciones')}>Alineaciones</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Personas')}>Personas</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Jugadores')}>Jugadores</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Directores Técnicos')}>Directores Técnicos</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Jugadores en Alineación')}>Jugadores en Alineación</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('BP Participations')}>BP Participations</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Equipos en el Campo')}>Equipos en el Campo</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Puntuaciones')}>Puntuaciones</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Juegos')}>Juegos</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Pitchers')}>Pitchers</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Jugadores Estrella')}>Jugadores Estrella</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Jugadores en Posición')}>Jugadores en AlineaciónPosición</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Intercambios de Jugadores')}>Intercambios de Jugadores</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Series')}>Series</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Direction Team')}>Equipos de Dirección</li>}
          {/* Añade más opciones aquí según sea necesario */}
        </ul>
      </div>
      <div className="sidebar-footer">
        <button onClick={onModalOpen}>Account</button>
      </div>
    </div>
  );
}

export default Sidebar;
