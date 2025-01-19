import React from 'react';

function Sidebar({ role, onOptionSelect, onModalOpen }) {
  return (
    <div className='sidebar'>
      <ul>
        {role === 'Admin' && <li onClick={() => onOptionSelect('Player List')}>Player List</li>}
        <li onClick={() => onOptionSelect('Other Option')}>Other Option</li>
        {/* Añade más opciones aquí según sea necesario */}
      </ul>
      <div className="sidebar-footer">
        <button onClick={onModalOpen}>Account</button>
      </div>
    </div>
  );
}

export default Sidebar;

