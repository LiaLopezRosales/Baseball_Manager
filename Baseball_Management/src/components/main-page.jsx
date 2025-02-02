import React, { useState, useEffect } from 'react';

function MainPage() {
    return(
        <div className='base-page'>
            <h1>Bienvenido a la Plataforma de Gestión de Campeonatos de Baseball</h1>
            <p>
                Esta página está pensada para ofrecer un acceso fácil y rápido a los fanáticos del 
                Baseball a datos, estadísticas, cuentas y otras funcionalidades en tiempo real, además
                de ofrecer una solución integral para la gestión eficiente de campeonatos de béisbol.
                Puede ver información de primera mano sobre sus ligas y equipos favoritos, o consultar 
                y contrastar información sobre temporadas pasadas. También tenemos facilidades para 
                que el equipo técnico de los equipos haga cambios y tenga mejor organización. Nuestro
                objetivo es facilitar la organización, seguimiento y promoción de eventos deportivos,
                asegurando que cada torneo se desarrolle de manera fluida y profesional.  
            </p>
        </div>
    );
}

export default MainPage;
