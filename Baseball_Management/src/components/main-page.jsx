import React, { useState, useEffect } from 'react';

function MainPage({ onTeamChange, onPitcherChange, onSeasonChange }) {

    const [data, setData] = useState(null);
    const [data2, setData2] = useState(null);
    const [data3, setData3] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedPitcher, setSelectedPitcher] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(null);

    // Manejar el cambio de selección
    const handleTeamChange = (event) => {
        setSelectedTeam(event.target.value);
        onTeamChange(event)
    };

    const handlePitcherChange = (event) => {
        setSelectedPitcher(event.target.value);
        onPitcherChange(event)
    };

    const handleSeasonChange = (event) => {
        setSelectedSeason(event.target.value);
        onSeasonChange(event)
    };

    useEffect(() => {
        const fetchData = async () => {
            const url = `http://localhost:8000/teams`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData(result); // Guardar los datos en el estado
            } catch (error) {
                setError(error); // Guardar el error en el estado
            } finally {
                setLoading(false); // Cambiar el estado de carga
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const url = `http://localhost:8000/pitchers`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData2(result); // Guardar los datos en el estado
            } catch (error) {
                setError(error); // Guardar el error en el estado
            } finally {
                setLoading(false); // Cambiar el estado de carga
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const url = `http://localhost:8000/seasons`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData3(result); // Guardar los datos en el estado
            } catch (error) {
                setError(error); // Guardar el error en el estado
            } finally {
                setLoading(false); // Cambiar el estado de carga
            }
        };

        fetchData();
    }, []);

    return(
        <div className='base-page'>
            <h1>Bienvenido a la app de Gestión de Campeonatos de Baseball</h1>
            <p>
                Esta página está pensada para ofrecer un acceso fácil y rápido a los fanáticos del 
                Baseball a datos, estadísticas, cuentas y otras funcionalidades en tiempo real.
                Puede ver información de primera mano sobre sus ligas y equipos favoritos, o consultar 
                y contrastar información sobre temporadas pasadas. Además tenemos facilidades para 
                que el equipo técnico de los equipos haga cambios y tenga mejor organización. 
                ¡Bienvenidos fanáticos del Baseball!
            </p>

            <select name="team" id="team" value={selectedTeam} onChange={handleTeamChange}>
            <option value="">-- Selecciona un equipo --</option>
                {data && data.map(option => ( 
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>

            <br />

            <select name="pitcher" id="pitcher" value={selectedPitcher} onChange={handlePitcherChange}>
            <option value="">-- Selecciona un pitcher --</option>
                {data2 && data2.map(option => ( 
                    <option key={option.id} value={option.id}>
                        {option.P_id}
                    </option>
                ))}
            </select>

            <br />

            <select name="season" id="season" value={selectedSeason} onChange={handleSeasonChange}>
            <option value="">-- Selecciona una serie --</option>
                {data3 && data3.map(option => ( 
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>

    );
}

export default MainPage;
