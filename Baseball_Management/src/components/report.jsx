import React, { useState, useEffect } from 'react';

function ParamsSelector({ report_id, onTeamSelect, onPitcherSelect, onPitcherLNSelect, onSeasonSelect, onSeriesSelect }) {
    const [data, setData] = useState(null);
    const [data2, setData2] = useState(null);
    const [data3, setData3] = useState(null);
    const [data4, setData4] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedPitcherName, setSelectedPitcherN] = useState();
    const [selectedPitcherLastname, setSelectedPitcherLn] = useState();
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedSeries, setSelectedSeries] = useState(null);

    // Manejar el cambio de selección
    const handleTeamChange = (event) => {
        setSelectedTeam(event.target.value);
        onTeamSelect(event.target.value);
    };

    const handlePitcherChange = (event) => {
        setSelectedPitcherN(event.target.value);
        onPitcherSelect(event.target.value);
    };

    const handlePitcherLastnameChange = (event) => {
        setSelectedPitcherLn(event.target.value);
        onPitcherLNSelect(event.target.value);
    };

    const handleSeasonChange = (event) => {
        setSelectedSeason(event.target.value);
        onSeasonSelect(event.target.value);
    };

    const handleSeriesChange = (event) => {
        setSelectedSeries(event.target.value);
        onSeriesSelect(event.target.value);
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
            const url = `http://localhost:8000/persons`;

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

    useEffect(() => {
        const fetchData = async () => {
            const url = `http://localhost:8000/series`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData4(result); // Guardar los datos en el estado
            } catch (error) {
                setError(error); // Guardar el error en el estado
            } finally {
                setLoading(false); // Cambiar el estado de carga
            }
        };

        fetchData();
    }, []);

    switch (report_id) {
        case 0:
        case 2:
            return (
                <select name="season" id="season" value={selectedSeason} onChange={handleSeasonChange}>
                    <option value="">-- Selecciona una temporada --</option>
                    {data3 && data3.map(option => (
                        <option key={option.id} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            );
        case 1:
            return (
                <select name="series" id="series" value={selectedSeries} onChange={handleSeriesChange}>
                    <option value="">-- Selecciona una serie --</option>
                    {data4 && data4.map(option => (
                        <option key={option.id} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            );
        case 4:
            return (
                <div>
                    <input type='text' name="pitcher_n" id="pitcher" value={selectedPitcherName} autoCapitalize='words' placeholder='Nombre del pitcher' onChange={handlePitcherChange}></input>
                    <input type='text' name="pitcher_ln" id="pitcher2" value={selectedPitcherLastname} autoCapitalize='words' placeholder='Apellido del pitcher' onChange={handlePitcherLastnameChange}></input>
                </div>
            );
        case 8:
            return (
                <select name="team" id="team" value={selectedTeam} onChange={handleTeamChange}>
                    <option value="">-- Selecciona un equipo --</option>
                    {data && data.map(option => (
                        <option key={option.id} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            );
        default:
            return <div></div>;
    }
}

const ReportComponent = ({ report_id, report_name }) => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [team_name, setSelectedTeam] = useState('');
    const [pitcher_name, setSelectedPitcher] = useState('');
    const [pitcher_lastname, setSelectedPitcherLastname] = useState('');
    const [season_name, setSelectedSeason] = useState('');
    const [serie_name, setSelectedSeries] = useState('');
    const [exportFormat, setExportFormat] = useState('pdf'); // Estado para el formato de exportación
    const [exportJson, setExportJson] = useState(null); // Estado para almacenar el JSON que se enviará

    useEffect(() => {
        let params;
        switch (report_id) {
            case 3:
            case 5:
            case 6:
            case 7:
                params = new URLSearchParams({ report_id });
                break;
            case 0:
            case 2:
                params = new URLSearchParams({ report_id, season_name });
                break;
            case 1:
                params = new URLSearchParams({ report_id, serie_name });
                break;
            case 4:
                params = new URLSearchParams({ report_id, pitcher_name, pitcher_lastname });
                break;
            case 8:
                params = new URLSearchParams({ report_id, team_name });
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
    }, [report_id, season_name, serie_name, pitcher_name, pitcher_lastname, team_name]);

    const handleExport = async () => {
        // Asegúrate de que `data` sea un objeto con la clave "Sección 1"
        const exportData = {
            filename: report_name,
            format: exportFormat,
            data: {
                "": Array.isArray(data) ? data : data[""] // Asegúrate de que sea un array
            }
        };
    
        // Actualiza el estado con el JSON que se enviará
        setExportJson(exportData);
    
        try {
            const response = await fetch('http://127.0.0.1:8000/api/queries/export/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exportData),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report_name}.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error exporting report:', error);
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <h1>{report_name}</h1>

            <ParamsSelector
                report_id={report_id}
                onTeamSelect={setSelectedTeam}
                onPitcherSelect={setSelectedPitcher}
                onPitcherLNSelect={setSelectedPitcherLastname}
                onSeasonSelect={setSelectedSeason}
                onSeriesSelect={setSelectedSeries}
            />

            <div>
                <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                </select>
                <button onClick={handleExport}>Exportar</button>
            </div>

            {/* Mostrar el JSON que se enviará }
            {exportJson && (
                <div>
                    <h2>JSON que se enviará:</h2>
                    <pre>{JSON.stringify(exportJson, null, 2)}</pre>
                </div>
            )}*/}

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