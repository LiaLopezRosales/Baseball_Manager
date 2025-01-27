import React, { useState, useEffect } from 'react';

const ReportComponent = ({ report_id, season_id, pitcher_id, team_id }) => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        let params
        switch (report_id) {
            case 3:
            case 5:
            case 6:
            case 7:
                params = new URLSearchParams({ report_id });
                break;
            case 0:
            case 1:
            case 2:
                params = new URLSearchParams({ report_id, season_id });
                break;   
            case 4:
                params = new URLSearchParams({ report_id, pitcher_id });
                break;
            case 8:
                params = new URLSearchParams({ report_id, team_id });
                break;
            default:
                break;      
        }
        
        const url = `http://localhost:8000/api/queries/reports/?${params.toString()}`;

        // Realizar la solicitud GET
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(data); // Guardar los datos en el estado
                setLoading(false); // Cambiar el estado de carga
            })
            .catch(error => {
                setError(error); // Guardar el error en el estado
                setLoading(false); // Cambiar el estado de carga
            });
    }, [report_id, team_id, pitcher_id, season_id]); // El efecto se ejecuta solo una vez al montar el componente

    if (loading) {
        return <div>Cargando...</div>; // Mensaje mientras se cargan los datos
    }

    if (error) {
        return <div>Error: {error.message}</div>; // Mensaje de error si ocurre uno
    }

    return (
        // <div>
        //     <h1>Datos del Reporte</h1>
        //     <pre>{JSON.stringify(data, null, 2)}</pre> {/* Mostrar los datos */}
        // </div>


        <div>

        <h1>Datos del Reporte</h1>
        
        <ul>
        {Array.isArray(data) && data.length > 0 ? (
                data.map((item, index) => (
                    <li key={index}>
                        <strong>Elemento {index + 1}:</strong>
                        <ul>
                            {Object.keys(item).map(key => (
                                <li key={key}> {key}: {item[key]} </li>
                            ))}
                        </ul>
                    </li>
                ))
            ) : (
                <div>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </ul>
    </div>
        );
};

export default ReportComponent;
