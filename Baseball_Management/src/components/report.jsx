import React, { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { API_URL } from '../api';
import GradientSpinner from './ui/GradientSpinner';
import './report.css';

function ParamsSelector({ report_id, onTeamSelect, onPitcherSelect, onPitcherLNSelect, onSeasonSelect, onSeriesSelect }) {
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [series, setSeries] = useState([]);

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPitcherN, setSelectedPitcherN] = useState('');
  const [selectedPitcherLn, setSelectedPitcherLn] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');

  useEffect(() => {
    const load = (url, setter) =>
      fetch(`${API_URL}${url}`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setter)
        .catch(() => setter([]));
    load('/teams', setTeams);
    load('/seasons', setSeasons);
    load('/series', setSeries);
  }, []);

  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
    onTeamSelect(e.target.value);
  };
  const handlePitcherChange = (e) => {
    setSelectedPitcherN(e.target.value);
    onPitcherSelect(e.target.value);
  };
  const handlePitcherLastnameChange = (e) => {
    setSelectedPitcherLn(e.target.value);
    onPitcherLNSelect(e.target.value);
  };
  const handleSeasonChange = (e) => {
    setSelectedSeason(e.target.value);
    onSeasonSelect(e.target.value);
  };
  const handleSeriesChange = (e) => {
    setSelectedSeries(e.target.value);
    onSeriesSelect(e.target.value);
  };

  const renderOptions = (list) =>
    list.map((option) => (
      <option key={option.id} value={option.name}>
        {option.name}
      </option>
    ));

  switch (report_id) {
    case 0:
    case 2:
      return (
        <select name="season" value={selectedSeason} onChange={handleSeasonChange}>
          <option value="">-- Selecciona una temporada --</option>
          {renderOptions(seasons)}
        </select>
      );
    case 1:
      return (
        <select name="series" value={selectedSeries} onChange={handleSeriesChange}>
          <option value="">-- Selecciona una serie --</option>
          {renderOptions(series)}
        </select>
      );
    case 4:
      return (
        <div>
          <input
            type="text"
            name="pitcher_n"
            value={selectedPitcherN}
            autoCapitalize="words"
            placeholder="Nombre del pitcher"
            onChange={handlePitcherChange}
          />
          <input
            type="text"
            name="pitcher_ln"
            value={selectedPitcherLn}
            autoCapitalize="words"
            placeholder="Apellido del pitcher"
            onChange={handlePitcherLastnameChange}
          />
        </div>
      );
    case 8:
      return (
        <select name="team" value={selectedTeam} onChange={handleTeamChange}>
          <option value="">-- Selecciona un equipo --</option>
          {renderOptions(teams)}
        </select>
      );
    default:
      return <div />;
  }
}

const ReportComponent = ({ report_id, report_name }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [team_name, setSelectedTeam] = useState('');
  const [pitcher_name, setSelectedPitcher] = useState('');
  const [pitcher_lastname, setSelectedPitcherLastname] = useState('');
  const [season_name, setSelectedSeason] = useState('');
  const [serie_name, setSelectedSeries] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');

  const fetchReport = () => {
    setLoading(true);
    setError(null);
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
        params = new URLSearchParams({ report_id });
        break;
    }

    fetch(`${API_URL}/api/queries/reports/?${params.toString()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al obtener el reporte');
        }
        return response.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report_id, season_name, serie_name, pitcher_name, pitcher_lastname, team_name]);

  const handleExport = async () => {
    const exportData = {
      filename: report_name,
      format: exportFormat,
      data: {
        '': Array.isArray(data) ? data : data || [],
      },
    };

    try {
      const response = await fetch(`${API_URL}/api/queries/export/`, {
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
    } catch (err) {
      console.error('Error exporting report:', err);
    }
  };

  if (loading) {
    return (
      <div className="reports-container">
        <GradientSpinner label="Cargando reporte…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="reports-error">
          <p>No se pudo cargar el reporte: {error.message}</p>
          <button className="export-button" onClick={fetchReport}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={16} /> Reintentar
            </span>
          </button>
        </div>
      </div>
    );
  }

  const rawRows = Array.isArray(data) ? data : data && data[''] ? data[''] : null;

  return (
    <div className="reports-container">
      <h1>{report_name}</h1>

      <div className="reports-toolbar">
        <div className="params-selector">
          <ParamsSelector
            report_id={report_id}
            onTeamSelect={setSelectedTeam}
            onPitcherSelect={setSelectedPitcher}
            onPitcherLNSelect={setSelectedPitcherLastname}
            onSeasonSelect={setSelectedSeason}
            onSeriesSelect={setSelectedSeries}
          />
        </div>

        <div className="export-controls">
          <select
            className="export-select"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
          <button className="export-button" onClick={handleExport}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Download size={16} /> Exportar
            </span>
          </button>
        </div>
      </div>

      <div className="reports-table-container">
        {rawRows && rawRows.length > 0 ? (
          <table className="reports-table">
            <thead>
              <tr>
                {Object.keys(rawRows[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rawRows.map((item, index) => (
                <tr key={index}>
                  {Object.keys(item).map((key) => (
                    <td key={key}>{item[key] ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : data ? (
          <pre className="reports-pre">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <div className="reports-empty">No hay datos para este reporte.</div>
        )}
      </div>
    </div>
  );
};

export default ReportComponent;
