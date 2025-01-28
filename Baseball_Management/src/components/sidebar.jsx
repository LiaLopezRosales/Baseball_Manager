import React from 'react';
import './sidebar.css';

function Sidebar({ role, onOptionSelect, onModalOpen }) {
  return (
    <div className='sidebar'>
      <div className='sidebar-content'>
        <ul>
          <li onClick={() => onOptionSelect('Main')}>Main</li>
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
          {role === 'Admin' && <li onClick={() => onOptionSelect('BP Participations')}>Participación de Jugadores</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Equipos en el Campo')}>Equipos en el Campo</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Puntuaciones')}>Marcadores</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Juegos')}>Juegos</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Pitchers')}>Lanzadores</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Jugadores Estrella')}>Jugadores Estrella</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Jugadores en Posición')}>Jugadores en Posición</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Intercambios de Jugadores')}>Cambios de Jugador</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Series')}>Series</li>}
          {role === 'Admin' && <li onClick={() => onOptionSelect('Direction Team')}>Equipos de Dirección</li>}
          {role ==='Director Técnico' && <li onClick={() => onOptionSelect('DT')}>Formulario Director Técnico</li>}
          <li onClick={() => onOptionSelect('Qy')}>Queries</li>
          <li onClick={() => onOptionSelect('Equipos ganadores y directores técnicos por temporadas')}>Equipos ganadores y directores técnicos por temporadas</li>
          <li onClick={() => onOptionSelect('Jugadores estrellas')}>Jugadores estrella por serie</li>
          <li onClick={() => onOptionSelect('Primer y último lugar')}>Primer y último lugar por serie/temporada</li>
          <li onClick={() => onOptionSelect('Series con más/menos juegos celebrados')}>Series con más/menos juegos celebrados</li>
          <li onClick={() => onOptionSelect('Carreras limpias/juegos ganados')}>Carreras limpias/juegos ganados por un pitcher</li>
          <li onClick={() => onOptionSelect('Average')}>Average de bateo de cada Jugador</li>
          <li onClick={() => onOptionSelect('Estadísticas de juegos por equipos')}>Estadísticas de juegos por equipos</li>
          <li onClick={() => onOptionSelect('Efectividad por posición')}>Jugadores con más efectividad por posición</li>
          <li onClick={() => onOptionSelect('Jugadores de un equipo')}>Jugadores de un equipo</li>
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
