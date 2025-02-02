// Baseball_Management/src/components/TeamManagement.jsx

import React from 'react';
import PlayerSwapForm from './PlayerSwapForm';
import PlayerSwapTable from './PlayerSwapTable';

function TeamManagement({ teamId }) {
    return (
        <div>
            <h1>Gestión de Cambios de Jugadores</h1>
            <PlayerSwapForm teamId={teamId} />
            <PlayerSwapTable teamId={teamId} />
        </div>
    );
}

export default TeamManagement;