import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiGet } from '../api';
import FavoritesPanel from './FavoritesPanel';
import LandingHeader from './landing/LandingHeader';
import LandingHero from './landing/LandingHero';
import { getInitialTheme, applyTheme } from '../theme';
import './landing.css';

const REPORT_URL = (id) => `/api/queries/reports/?report_id=${id}`;

/* ─── helpers de datos ─────────────────────────────────────────────────────── */

function buildStandingsFromScores(scores, teams) {
  const byId = {};
  (teams || []).forEach((t) => {
    byId[t.id] = {
      id: t.id,
      name: t.name,
      initials: t.initials,
      color: t.color,
      w: 0,
      l: 0,
      pf: 0,
      pc: 0,
    };
  });

  /* Indexar scores por teamId (para last10) */
  const scoresByTeam = {};
  (scores || []).forEach((s) => {
    const wid = s.winner;
    const lid = s.loser;
    if (wid && !scoresByTeam[wid]) scoresByTeam[wid] = [];
    if (lid && !scoresByTeam[lid]) scoresByTeam[lid] = [];
    if (wid) scoresByTeam[wid].push({ id: s.id, win: true });
    if (lid) scoresByTeam[lid].push({ id: s.id, win: false });
  });

  (scores || []).forEach((s) => {
    const w = byId[s.winner];
    const l = byId[s.loser];
    if (w) {
      w.w += 1;
      w.pf += Number(s.w_points) || 0;
      w.pc += Number(s.l_points) || 0;
    }
    if (l) {
      l.l += 1;
      l.pf += Number(s.l_points) || 0;
      l.pc += Number(s.w_points) || 0;
    }
  });

  return Object.values(byId)
    .map((t) => {
      const total = t.w + t.l;
      const pct = total ? t.w / total : 0;
      const dif = t.pf - t.pc || 0;

      /* last10: últimos 10 juegos ordenados por id (cronológico) */
      const hist = (scoresByTeam[t.id] || []).sort((a, b) => a.id - b.id);
      const last10Slice = hist.slice(-10);
      const last10W = last10Slice.filter((s) => s.win).length;
      const last10L = last10Slice.length - last10W;
      const last10 = hist.length ? `${last10W}–${last10L}` : '—';

      return {
        ...t,
        pct,
        pctStr: pct.toFixed(3).replace(/^0/, ''),
        dif: dif > 0 ? `+${dif}` : String(dif),
        jg: t.w,
        jp: t.l,
        runsFor: t.pf,
        runsAgainst: t.pc,
        last10,
      };
    })
    .sort((a, b) => b.w - a.w || b.pct - a.pct || b.dif - a.dif);
}

/* Racha W/L para el líder. */
function streakFor(teamId, scores) {
  const seq = (scores || [])
    .filter((s) => s.winner === teamId || s.loser === teamId)
    .sort((a, b) => (a.id || 0) - (b.id || 0))
    .map((s) => (s.winner === teamId ? 'W' : 'L'));
  let cnt = 0;
  const last = seq[seq.length - 1];
  if (!last) return '—';
  for (let i = seq.length - 1; i >= 0; i -= 1) {
    if (seq[i] === last) cnt += 1;
    else break;
  }
  return `${last}${cnt}`;
}

/* Cadena DT: direction-team → technical-directors → workers → persons. */
function buildDTChain(directionTeams, technicalDirectors, workers, persons) {
  const personsById = {};
  (persons || []).forEach((p) => { personsById[p.id] = p; });
  const workersById = {};
  (workers || []).forEach((w) => { workersById[w.id] = w; });
  const tdirsByDtId = {};
  (technicalDirectors || []).forEach((td) => {
    tdirsByDtId[td.direction_team] = td;
  });

  return (teamId) => {
    const dtm = (directionTeams || []).find((d) => Number(d.Team_id) === Number(teamId));
    if (!dtm) return null;
    const tdir = tdirsByDtId[dtm.id];
    if (!tdir) return null;
    const w = workersById[tdir.W_id];
    if (!w) return null;
    const p = personsById[w.P_id];
    if (!p) return null;
    return `${p.name} ${p.lastname}`.trim() || null;
  };
}

/* Última temporada de la lista de temporadas */
function lastSeasonNameFn(seasons) {
  return seasons[seasons.length - 1]?.name || '—';
}

/* ─── Componente ───────────────────────────────────────────────────────────── */

function Landing({ isLogged = false, role = '', onModalOpen, onRegisterOpen, onLogout }) {
  const [standingsReport, setStandingsReport] = useState([]);
  const [batters, setBatters] = useState([]);
  const [champions, setChampions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [players, setPlayers] = useState([]);
  const [pitchers, setPitchers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [bpParticipations, setBpParticipations] = useState([]);
  const [games, setGames] = useState([]);
  const [teamOnFields, setTeamOnFields] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [playerInPositions, setPlayerInPositions] = useState([]);
  const [directionTeams, setDirectionTeams] = useState([]);
  const [technicalDirectors, setTechnicalDirectors] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [persons, setPersons] = useState([]);
  const [teamIdByName, setTeamIdByName] = useState({});
  const [error, setError] = useState(null);
  const [theme, setThemeState] = useState(() => getInitialTheme());

  useEffect(() => {
    let active = true;

    Promise.all([
      apiGet('/teams/'),
      apiGet('/baseball-players/'),
      apiGet('/persons/'),
      apiGet('/seasons/'),
      apiGet('/scores/'),
      apiGet(REPORT_URL(6)),
      apiGet(REPORT_URL(5)),
      apiGet(REPORT_URL(0)),
      apiGet('/direction-teams/'),
      apiGet('/technical-directors/'),
      apiGet('/workers/'),
      apiGet('/pitchers/'),
      apiGet('/positions/'),
      apiGet('/bp-participations/'),
      apiGet('/games/'),
      apiGet('/players-in-position/'),
      apiGet('/teams-on-field/'),
      apiGet('/lineups/'),
    ])
      .then(
        ([
          teamsData,
          playersData,
          personsData,
          seasonsData,
          scoresData,
          standingsData,
          battersData,
          championsData,
          directionTeamsData,
          technicalDirectorsData,
          workersData,
          pitchersData,
          positionsData,
          bpParticipationsData,
          gamesData,
          playerInPositionsData,
          teamOnFieldsData,
          lineupsData,
        ]) => {
          if (!active) return;

          setTeams(teamsData || []);
          setScores(scoresData || []);
          setSeasons(seasonsData || []);
          setPlayers(playersData || []);
          setStandingsReport(standingsData || []);
          setBatters((battersData || []).slice(0, 5));
          setChampions(championsData || []);
          setDirectionTeams(directionTeamsData || []);
          setTechnicalDirectors(technicalDirectorsData || []);
          setWorkers(workersData || []);
          setPersons(personsData || []);
          setPitchers(pitchersData || []);
          setPositions(positionsData || []);
          setBpParticipations(bpParticipationsData || []);
          setGames(gamesData || []);
          setPlayerInPositions(playerInPositionsData || []);
          setTeamOnFields(teamOnFieldsData || []);
          setLineups(lineupsData || []);

          const teamMap = {};
          (teamsData || []).forEach((t) => { teamMap[t.name] = t.id; });
          setTeamIdByName(teamMap);
        }
      )
      .catch((err) => {
        if (active) setError(err);
      });

    return () => { active = false; };
  }, []);

  const toggleTheme = () => {
    setThemeState((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  };

  /* ─── Datos derivados (useMemo) ─────────────────────────────────────────── */

  const standings = useMemo(() => {
    const reportByName = {};
    (standingsReport || []).forEach((row) => { reportByName[row.Equipo] = row; });
    const list = buildStandingsFromScores(scores, teams).map((r) => ({
      ...r,
      ...(reportByName[r.name] || {}),
    }));
    const leaderRow = list[0];
    const leaderW = leaderRow?.w || 0;
    const leaderL = leaderRow?.l || 0;
    return list.map((r) => {
      const gb = (leaderW - r.w + r.l - leaderL) / 2;
      return {
        ...r,
        gamesBack: leaderRow && leaderRow.id !== r.id ? gb.toFixed(1).replace(/\.0$/, '') : '-',
      };
    });
  }, [standingsReport, scores, teams]);

  const leader = standings[0] || null;
  const totalPlayed = scores.length;
  const lastSeasonName = lastSeasonNameFn(seasons);

  /* Próximos juegos: sin score aún, fecha futura (o todos los pendientes),
     resolviendo equipos vía teams-on-field → lineups → teams. */
  const upcomingGames = useMemo(() => {
    const totfById = {};
    (teamOnFields || []).forEach((t) => { totfById[t.id] = t; });
    const lineupById = {};
    (lineups || []).forEach((l) => { lineupById[l.id] = l; });
    const teamById = {};
    (teams || []).forEach((t) => { teamById[t.id] = t; });

    const resolve = (game) => {
      const date = (game.date || '').slice(0, 10);
      const resolveTeam = (totfId) => {
        const totf = totfById[totfId];
        if (!totf) return null;
        const lineup = lineupById[totf.lineup_id];
        if (!lineup) return null;
        return teamById[lineup.team_id] || null;
      };
      return { ...game, date, localTeam: resolveTeam(game.local), rivalTeam: resolveTeam(game.rival) };
    };

    const pending = (games || []).filter((g) => g.score === null).map(resolve);
    if (!pending.length) return [];
    const today = new Date().toISOString().slice(0, 10);
    const source = pending.some((g) => g.date >= today) ? pending.filter((g) => g.date >= today) : pending;
    return source
      .filter((g) => g.localTeam && g.rivalTeam)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
      .slice(0, 5);
  }, [games, teamOnFields, lineups, teams]);

  /* Cadena DT (resuelta una vez que todo esté cargado) */
  const resolveDT = useMemo(
    () => buildDTChain(directionTeams, technicalDirectors, workers, persons),
    [directionTeams, technicalDirectors, workers, persons]
  );

  /* Líder enriquecido (con DT, streak, last10, runsFor/Against) */
  const leaderEnriched = useMemo(() => {
    if (!leader) return null;
    return {
      ...leader,
      dt: resolveDT(leader.id) || null,
      streak: streakFor(leader.id, scores),
    };
  }, [leader, resolveDT, scores]);

  /* Promedio liga: media de batting_average de todos los jugadores */
  const leagueAvg = useMemo(() => {
    const avgs = (players || [])
      .map((p) => Number(p.batting_average))
      .filter((v) => !isNaN(v) && v > 0);
    if (!avgs.length) return 0;
    return avgs.reduce((a, b) => a + b, 0) / avgs.length;
  }, [players]);

  /* Top bateo: mejor promedio del reporte 5 */
  const topBateo = useMemo(() => {
    if (!batters.length) return null;
    const best = batters[0];
    const avg = Number(best['Promedio de Bateo'] || best.Average || 0);
    return { promedio: avg, nombre: `${best.Nombre} ${best.Apellido}` };
  }, [batters]);

  /* Métricas para el hero */
  const heroMetrics = useMemo(
    () => ({
      topBateo,
      promedioLiga: leagueAvg,
      franquicias: teams.length,
    }),
    [topBateo, leagueAvg, teams]
  );

  /* Palmarés: campeones ordenados cronológicamente */
  const palmares = useMemo(() => {
    return [...champions].sort((a, b) => {
      if (a.Temporada < b.Temporada) return -1;
      if (a.Temporada > b.Temporada) return 1;
      return 0;
    });
  }, [champions]);

  /* ─── S3: Resumen Ejecutivo ─────────────────────────────────────────────── */
  const bentoData = useMemo(() => {
    const totalGames = games.length || 1;
    const gamesPlayed = scores.length;
    const calendarPct = Math.round((gamesPlayed / totalGames) * 100);
    const lastTwoScores = [...scores].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 2);
    const pitchersList = pitchers || [];
    const totalK = pitchersList.reduce((sum, p) => sum + (Number(p.strikeouts) || 0), 0);
    const avgEra = pitchersList.length
      ? pitchersList.reduce((sum, p) => sum + (Number(p.running_average) || 0), 0) / pitchersList.length
      : 0;
    return {
      gamesPlayed,
      calendarPct: Math.min(calendarPct, 100),
      lastTwoScores,
      totalK,
      avgEra: avgEra.toFixed(2),
      teamCount: teams.length,
      pitcherCount: pitchersList.length,
    };
  }, [games, scores, pitchers, teams]);

  /* ─── S5: Podio de Bateo — enriquecer top 3 del reporte 5 ───────────────── */
  const podiumData = useMemo(() => {
    if (!batters.length) return [];
    const top3 = batters.slice(0, 3);
    const personsById = {};
    (persons || []).forEach((p) => { personsById[p.id] = p; });
    const bpById = {};
    (players || []).forEach((bp) => { bpById[bp.id] = bp; });
    const bpByPersonId = {};
    (players || []).forEach((bp) => { bpByPersonId[bp.P_id] = bp; });
    const pipByBpId = {};
    (playerInPositions || []).forEach((pip) => { pipByBpId[pip.BP_id] = pip; });
    const partByPersonId = {};
    (bpParticipations || []).forEach((part) => { partByPersonId[part.BP_id] = part; });

    return top3.map((b) => {
      const person = (persons || []).find(
        (p) => `${p.name} ${p.lastname}`.trim() === `${b.Nombre} ${b.Apellido}`.trim()
      );
      const bp = person ? bpByPersonId[person.id] : null;
      const pip = bp ? pipByBpId[bp.id] : null;
      const part = bp ? partByPersonId[bp.P_id] : null;
      const pos = pip ? (positions || []).find((pos) => pos.id === pip.position) : null;
      const team = part ? (teams || []).find((t) => t.id === part.team_id) : null;
      const fullName = `${b.Nombre} ${b.Apellido}`.trim();
      const initials = fullName.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
      const obp = bp ? Number(bp.obp) || 0 : 0;
      const slg = bp ? Number(bp.slg) || 0 : 0;
      return {
        name: fullName,
        initials: initials || '—',
        avg: Number(b['Promedio de Bateo'] || b.Average || 0),
        hr: bp ? bp.home_runs : 0,
        rbi: bp ? bp.rbi : 0,
        obp,
        slg,
        ops: obp + slg,
        playerId: bp ? bp.id : null,
        teamId: team ? team.id : null,
        teamName: team ? team.name : '',
        position: pos ? pos.name : '',
      };
    });
  }, [batters, persons, players, playerInPositions, bpParticipations, positions, teams]);

  /* ─── S6: Estrellas por Posición ────────────────────────────────────────── */
  const starsData = useMemo(() => {
    if (!playerInPositions.length) return [];
    const personsById = {};
    (persons || []).forEach((p) => { personsById[p.id] = p; });
    const bpById = {};
    (players || []).forEach((bp) => { bpById[bp.id] = bp; });
    const bpByPersonId = {};
    (players || []).forEach((bp) => { bpByPersonId[bp.P_id] = bp; });
    const partByPersonId = {};
    (bpParticipations || []).forEach((part) => { partByPersonId[part.BP_id] = part; });
    const pitcherByPersonId = {};
    (pitchers || []).forEach((p) => { pitcherByPersonId[p.P_id] = p; });

    const posGroups = {};
    (playerInPositions || []).forEach((pip) => {
      const posObj = (positions || []).find((p) => p.id === pip.position);
      const posName = posObj ? posObj.name : String(pip.position);
      if (!posGroups[posName]) posGroups[posName] = [];
      posGroups[posName].push(pip);
    });

    const positionOrder = ['Pitcher', 'Catcher', 'First Base', 'Second Base', 'Third Base', 'Shortstop', 'Left Field', 'Center Field', 'Right Field'];
    const starCards = [];
    const ofPositions = ['Left Field', 'Center Field', 'Right Field'];

    const resolveCard = (pip) => {
      const bp = bpById[pip.BP_id];
      const person = bp ? personsById[bp.P_id] : null;
      const part = bp ? partByPersonId[bp.P_id] : null;
      const team = part ? (teams || []).find((t) => t.id === part.team_id) : null;
      return {
        fullName: person ? `${person.name} ${person.lastname}` : '?',
        team: team ? team.name : '?',
        teamId: team ? team.id : null,
        war: bp ? bp.war : 0,
        effectiveness: pip.effectiveness,
        bp,
        pip,
        pitcher: bp ? pitcherByPersonId[bp.P_id] : null,
      };
    };

    for (const posName of positionOrder) {
      if (posName === 'Pitcher') {
        const sps = [...(posGroups['Pitcher'] || [])].sort(
          (a, b) => (Number(b.effectiveness) || 0) - (Number(a.effectiveness) || 0)
        );
        const rps = [...(posGroups['Pitcher'] || [])]
          .sort((a, b) => (Number(b.effectiveness) || 0) - (Number(a.effectiveness) || 0));
        (sps[0]) && starCards.push({ label: 'SP', ...resolveCard(sps[0]) });
        (rps[1]) && starCards.push({ label: 'RP', ...resolveCard(rps[1]) });
        continue;
      }
      if (posName === 'Left Field') {
        const ofPips = [...ofPositions.flatMap((op) => posGroups[op] || [])].sort(
          (a, b) => (Number(b.effectiveness) || 0) - (Number(a.effectiveness) || 0)
        );
        if (ofPips[0]) starCards.push({ label: 'OF', ...resolveCard(ofPips[0]) });
        continue;
      }
      if (ofPositions.includes(posName)) continue;
      const group = posGroups[posName] || [];
      if (!group.length) continue;
      group.sort((a, b) => (Number(b.effectiveness) || 0) - (Number(a.effectiveness) || 0));
      const shortLabel = {
        Catcher: 'C',
        'First Base': '1B',
        'Second Base': '2B',
        'Third Base': '3B',
        Shortstop: 'SS',
      }[posName] || posName;
      starCards.push({ label: shortLabel, ...resolveCard(group[0]) });
    }

    return starCards;
  }, [playerInPositions, positions, persons, players, bpParticipations, teams, pitchers]);

  const starStatRows = (star) => {
    const p = star.pitcher;
    const b = star.bp;
    const pp = star.pip;
    const fmt = (v) => Number(v).toFixed(3).replace(/^0/, '');
    if (p) {
      if (star.label === 'RP') {
        return [
          { label: 'Salvamentos', val: `${p.saves || 0}`, amber: true },
          { label: 'WHIP', val: (Number(p.whip) || 0).toFixed(2) },
        ];
      }
      return [
        { label: 'Récord / ERA', val: `${p.No_games_won}-${p.No_games_lost} • ${(Number(p.running_average) || 0).toFixed(2)} ERA`, amber: true },
        { label: 'Ponches (K)', val: `${p.strikeouts || 0} K (${p.innings_pitched || 0} IP)` },
      ];
    }
    switch (star.label) {
      case 'C':
        return [
          { label: 'Fildeo PCT', val: fmt(pp.fielding_pct), amber: true },
          { label: 'HR / RBI', val: `${b.home_runs} / ${b.rbi}` },
        ];
      case '1B':
        return [
          { label: 'AVG / OPS', val: `${fmt(b.batting_average)} / ${fmt((Number(b.obp) || 0) + (Number(b.slg) || 0))}`, amber: true },
          { label: 'Fildeo PCT', val: fmt(pp.fielding_pct) },
        ];
      case '3B':
        return [
          { label: 'Fildeo PCT', val: fmt(pp.fielding_pct), amber: true },
          { label: 'HR / RBI', val: `${b.home_runs} / ${b.rbi}` },
        ];
      case '2B':
      case 'SS':
        return [
          { label: 'Double Plays', val: `${pp.double_plays} DP`, amber: true },
          { label: 'Bases Robadas', val: `${pp.bases_stolen} SB` },
        ];
      case 'OF':
        return [
          { label: 'Asistencias OF', val: `${pp.assists_of} AST`, amber: true },
          { label: 'AVG / HR', val: `${fmt(b.batting_average)} / ${b.home_runs}` },
        ];
      default:
        return [
          { label: 'AVG / OPS', val: `${fmt(b.batting_average)} / ${fmt((Number(b.obp) || 0) + (Number(b.slg) || 0))}`, amber: true },
          { label: 'HR / RBI', val: `${b.home_runs} / ${b.rbi}` },
        ];
    }
  };

  /* ─── Error state ────────────────────────────────────────────────────────── */

  if (error) {
    return (
      <div className="landing">
        <LandingHeader
          isLogged={isLogged}
          role={role}
          theme={theme}
          onThemeChange={toggleTheme}
          onModalOpen={onModalOpen}
          onRegisterOpen={onRegisterOpen}
          onLogout={onLogout}
        />
        <div className="landing__section">
          <p>No se pudieron cargar las estadísticas de la liga.</p>
          <p className="landing__section-sub">{error.message}</p>
        </div>
      </div>
    );
  }

  /* ─── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div className="landing" data-theme={theme}>
      <LandingHeader
        isLogged={isLogged}
        role={role}
        userName={
          typeof localStorage !== 'undefined'
            ? localStorage.getItem('userName') || ''
            : ''
        }
        theme={theme}
        onThemeChange={toggleTheme}
        onModalOpen={onModalOpen}
        onRegisterOpen={onRegisterOpen}
        onLogout={onLogout}
      />

      {/* HERO */}
      <LandingHero
        label={lastSeasonName}
        leader={leaderEnriched}
        totalPlayed={totalPlayed}
        metrics={heroMetrics}
        theme={theme}
        onRegisterOpen={onRegisterOpen}
      />

      {/* S3: RESUMEN EJECUTIVO DE CIRCUITO */}
      <section className="landing__bento">
        <div className="landing__bento-inner">
          <div className="landing__bento-head">
            <div>
              <span className="landing__bento-eyebrow">Centro de Telemetría WBSC</span>
              <h2 className="landing__bento-title">Resumen Ejecutivo de Circuito</h2>
            </div>
          </div>
          <div className="landing__bento-grid">
            {/* Calendario */}
            <div className="landing__bento-card">
              <div className="landing__bento-card-top">
                <span className="landing__bento-label">Calendario Oficial</span>
              </div>
              <div className="landing__bento-big">{bentoData.gamesPlayed}</div>
              <p className="landing__bento-sub">Juegos oficiales disputados</p>
              {bentoData.lastTwoScores.length > 0 && (
                <div className="landing__bento-chips">
                  {bentoData.lastTwoScores.map((sc, i) => {
                    const wTeam = teams.find((t) => t.id === sc.winner);
                    const lTeam = teams.find((t) => t.id === sc.loser);
                    return (
                      <div key={i} className="landing__bento-chip">
                        <span className="landing__bento-chip-text">
                          {wTeam?.id ? (
                            <Link to={`/equipo/${wTeam.id}`} className="landing__bento-link">
                              {wTeam.initials || '—'}
                            </Link>
                          ) : (
                            wTeam?.initials || '—'
                          )}{' '}
                          {sc.w_points} - {sc.l_points}{' '}
                          {lTeam?.id ? (
                            <Link to={`/equipo/${lTeam.id}`} className="landing__bento-link">
                              {lTeam.initials || '—'}
                            </Link>
                          ) : (
                            lTeam?.initials || '—'
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Pitcheo */}
            <div className="landing__bento-card">
              <div className="landing__bento-card-top">
                <span className="landing__bento-label">Pitcheo Colectivo</span>
              </div>
              <div className="landing__bento-big landing__bento-big--amber">{bentoData.avgEra}</div>
              <p className="landing__bento-sub">Efectividad ERA promedio de liga</p>
              <div className="landing__bento-footer-row">
                <div>
                  <span className="landing__bento-footer-num">{bentoData.totalK.toLocaleString()}</span>
                  <span className="landing__bento-footer-label">Ponches Registrados</span>
                </div>
                <div className="landing__bento-k-badge">K</div>
              </div>
            </div>
            {/* Formato */}
            <div className="landing__bento-card">
              <div className="landing__bento-card-top">
                <span className="landing__bento-label">Formato de Liga</span>
              </div>
              <div className="landing__bento-big">{bentoData.teamCount}</div>
              <p className="landing__bento-sub">Franquicias en competencia</p>
              <div className="landing__bento-footer-row">
                <div className="landing__bento-bar-wrap">
                  <div className="landing__bento-bar">
                    <div
                      className="landing__bento-bar-fill"
                      style={{ width: `${bentoData.calendarPct}%` }}
                    />
                  </div>
                  <span className="landing__bento-bar-label">{bentoData.calendarPct}% del calendario cumplido</span>
                </div>
              </div>
            </div>
            {/* Comunidad */}
            <div className="landing__bento-card landing__bento-card--accent">
              <div className="landing__bento-card-top">
                <span className="landing__bento-label landing__bento-label--rose">Comunidad Fan Plus</span>
              </div>
              <div className="landing__bento-big-text">Sigue a tu Franquicia</div>
              <p className="landing__bento-sub">Recibe boxscores oficiales, outs decisivos y jonrones vía alerta Push instantánea.</p>
              <div className="landing__bento-cta-wrap">
                <button type="button" onClick={onRegisterOpen} className="landing__bento-cta">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                  Activar Alertas
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* S4: TABLA DE POSICIONES + DIFERENCIAL NETO */}
      <section className="landing__standings">
        <div className="landing__standings-inner">
          <div className="landing__standings-head">
            <div>
              <span className="landing__standings-eyebrow">{lastSeasonName}</span>
              <h2 className="landing__standings-title">Tabla Oficial de Posiciones</h2>
            </div>
            <div className="landing__standings-tabs">
              <button className="landing__tab landing__tab--active">General</button>
              <button className="landing__tab" disabled>Div. Norte</button>
              <button className="landing__tab" disabled>Div. Sur</button>
            </div>
          </div>
          <div className="landing__standings-grid">
            {/* Tabla */}
            <div className="landing__table-wrap">
              <div className="landing__table-scroll">
                <table className="landing__table">
                  <thead>
                    <tr>
                      <th>POS</th>
                      <th>EQUIPO</th>
                      <th>JJ</th>
                      <th>JG</th>
                      <th>JP</th>
                      <th>PCT</th>
                      <th>DIF</th>
                      <th>U10</th>
                      <th>RACHA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row, i) => (
                      <tr key={row.id || i} className={i === 0 ? 'landing__table-row--leader' : ''}>
                        <td className="landing__table-pos">{String(i + 1).padStart(2, '0')}</td>
                        <td className="landing__table-team">
                          <span className="landing__table-dot" style={{ background: row.color || '#888' }} />
                          {row.id ? (
                            <Link to={`/equipo/${row.id}`} className="landing__table-team-link">
                              {row.name}
                            </Link>
                          ) : (
                            row.name
                          )}
                        </td>
                        <td>{(row.w || 0) + (row.l || 0)}</td>
                        <td className="landing__table-bold">{row.w || 0}</td>
                        <td>{row.l || 0}</td>
                        <td className="landing__table-pct">{row.pctStr || '0'}</td>
                        <td>{row.gamesBack ?? row.dif ?? '-'}</td>
                        <td>{row.last10 || '—'}</td>
                        <td>
                          <span className={`landing__table-streak ${(streakFor(row.id, scores) || '').startsWith('W') ? 'landing__table-streak--w' : 'landing__table-streak--l'}`}>
                            {streakFor(row.id, scores) || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="landing__table-footer">
                <span className="landing__table-footer-text">
                  <span className="landing__table-footer-dot" />
                  LOS 4 PRIMEROS CLASIFICAN DIRECTO AL ROUND ROBIN SEMIFINAL
                </span>
                <Link to="/reglamento" className="landing__table-footer-link">
                  REGLAMENTO SERIE 2026
                </Link>
              </div>
            </div>
            {/* Diferencial */}
            <div className="landing__diff">
              <div className="landing__diff-head">
                <h3 className="landing__diff-title">Diferencial Neto (+/-)</h3>
                <span className="landing__diff-badge">CA - CP</span>
              </div>
              <p className="landing__diff-sub">Balance acumulado entre carreras anotadas y carreras permitidas.</p>
              <div className="landing__diff-bars">
                {standings.map((row, i) => {
                  const difVal = Number(row.dif) || 0;
                  const maxAbs = Math.max(...standings.map((s) => Math.abs(Number(s.dif) || 1)), 1);
                  const pct = Math.min((Math.abs(difVal) / maxAbs) * 100, 100);
                  const isPos = difVal >= 0;
                  return (
                    <div key={i} className="landing__diff-bar-row">
                      <div className="landing__diff-bar-head">
                        <span className="landing__diff-bar-name">{row.name}</span>
                        <span className={`landing__diff-bar-val ${isPos ? 'landing__diff-bar-val--pos' : 'landing__diff-bar-val--neg'}`}>
                          {isPos ? '+' : ''}{difVal}
                        </span>
                      </div>
                      <div className={`landing__diff-bar ${!isPos ? 'landing__diff-bar--neg' : ''}`}>
                        <div
                          className={`landing__diff-bar-fill ${isPos ? 'landing__diff-bar-fill--pos' : 'landing__diff-bar-fill--neg'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="landing__diff-legend">
                <span className="landing__diff-legend-item">
                  <span className="landing__diff-legend-dot landing__diff-legend-dot--pos" /> Superávit
                </span>
                <span className="landing__diff-legend-item">
                  <span className="landing__diff-legend-dot landing__diff-legend-dot--neg" /> Déficit
                </span>
              </div>
            </div>
            {/* Próximos juegos (solo escritorio ancho, min-width: 1600px) */}
            {upcomingGames.length > 0 && (
              <aside className="landing__recent">
                <div className="landing__recent-head">
                  <h3 className="landing__recent-title">Próximos Juegos</h3>
                  <span className="landing__recent-badge">{upcomingGames.length}</span>
                </div>
                <div className="landing__recent-list">
                  {upcomingGames.map((g) => {
                    const [, mm, dd] = (g.date || '').split('-');
                    return (
                      <div key={g.id} className="landing__recent-item">
                        <div className="landing__recent-mid">
                          <span className="landing__recent-team">
                            <span className="landing__recent-dot" style={{ background: g.localTeam.color || '#888' }} />
                            {g.localTeam.id ? (
                              <Link to={`/equipo/${g.localTeam.id}`} className="landing__recent-link">
                                {g.localTeam.name}
                              </Link>
                            ) : (
                              g.localTeam.name
                            )}
                          </span>
                          <span className="landing__recent-vs">vs</span>
                          <span className="landing__recent-team">
                            <span className="landing__recent-dot" style={{ background: g.rivalTeam.color || '#888' }} />
                            {g.rivalTeam.id ? (
                              <Link to={`/equipo/${g.rivalTeam.id}`} className="landing__recent-link">
                                {g.rivalTeam.name}
                              </Link>
                            ) : (
                              g.rivalTeam.name
                            )}
                          </span>
                        </div>
                        <div className="landing__recent-date">
                          <span>{dd}/{mm}</span>
                          <span className="landing__recent-live">Por jugar</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* S5: PODIO DE LÍDERES DE BATEO */}
      {podiumData.length > 0 && (
        <section className="landing__podium">
          <div className="landing__podium-inner">
            <div className="landing__podium-head">
              <span className="landing__podium-eyebrow">Premio Bate de Plata WBSC</span>
              <h2 className="landing__podium-title">Líderes de Bateo de la Liga</h2>
              <p className="landing__podium-sub">Top 3 por promedio oficial ofensivo (mínimo reglamentario: 3.1 apariciones al plato por juego).</p>
            </div>
            <div className="landing__podium-grid">
              {['gold', 'silver', 'bronze'].map((medal, i) => {
                const player = podiumData[i];
                const isGold = i === 0;
                const stepText = isGold
                  ? 'Líder Absoluto'
                  : `${medal.toUpperCase()} • ${player.avg.toFixed(3).replace(/^0/, '')}`;
                return (
                  <div key={medal} className={`landing__podium-col landing__podium-col--${medal}`}>
                    <div className={`landing__podium-card landing__podium-card--${medal}`}>
                      <div className={`landing__podium-rank-badge landing__podium-rank-badge--${medal}`}>
                        {i + 1}
                      </div>
                      <div className={`landing__podium-avatar landing__podium-avatar--${medal}`}>
                        <span>{player.initials}</span>
                      </div>
                      {isGold && (
                        <span className="landing__podium-leader-badge">★ Líder de Bateo Activo</span>
                      )}
                      <h3 className={`landing__podium-name landing__podium-name--${medal}`}>
                        {player.playerId ? (
                          <Link to={`/jugador/${player.playerId}`} className="landing__podium-link">
                            {player.name}
                          </Link>
                        ) : (
                          player.name
                        )}
                      </h3>
                      <span className="landing__podium-meta">
                        {player.teamId ? (
                          <Link to={`/equipo/${player.teamId}`} className="landing__podium-link">
                            {player.teamName}
                          </Link>
                        ) : (
                          player.teamName
                        )}
                        {' • '}
                        {player.position}
                      </span>
                      <div className={`landing__podium-hero-stat landing__podium-hero-stat--${medal}`}>
                        <span className={`landing__podium-hero-label landing__podium-hero-label--${medal}`}>
                          {isGold ? 'Promedio Oficial' : 'Promedio'}
                        </span>
                        <span className={`landing__podium-hero-num landing__podium-hero-num--${medal}`}>
                          {player.avg.toFixed(3).replace(/^0/, '')}
                        </span>
                      </div>
                      <div className={`landing__podium-sub-stats landing__podium-sub-stats--${medal}`}>
                        <div><span className="landing__podium-sub-label">HR</span><span>{player.hr}</span></div>
                        <div><span className="landing__podium-sub-label">RBI</span><span>{player.rbi}</span></div>
                        <div><span className="landing__podium-sub-label">OBP</span><span>{player.obp.toFixed(3).replace(/^0/, '')}</span></div>
                        {isGold ? (
                          <div>
                            <span className="landing__podium-sub-label landing__podium-sub-label--ops">OPS</span>
                            <span className="landing__podium-sub-ops">{player.ops.toFixed(3).replace(/^0/, '')}</span>
                          </div>
                        ) : (
                          <div><span className="landing__podium-sub-label">SLG</span><span>{player.slg.toFixed(3).replace(/^0/, '')}</span></div>
                        )}
                      </div>
                    </div>
                    <div className={`landing__podium-step landing__podium-step--${medal}`}>
                      {stepText}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="landing__podium-cta-wrap">
              <Link to="/reporte/average" className="landing__podium-cta">
                Ver Tabla Completa de Bateadores
                <span className="material-symbols-outlined" aria-hidden="true">
                  sports_baseball
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* S6: JUGADORES ESTRELLA POR POSICIÓN */}
      {starsData.length > 0 && (
        <section className="landing__stars">
          <div className="landing__stars-inner">
            <div className="landing__stars-head">
              <div>
                <span className="landing__stars-eyebrow">Cuadro de Honor WBSC</span>
                <h2 className="landing__stars-title">Jugadores Estrella por Posición</h2>
              </div>
              <p className="landing__stars-sub">
                Evaluados mediante métricas avanzadas WAR (Wins Above Replacement), efectividad de fildeo y DRS defensivo.
              </p>
            </div>
            <div className="landing__stars-grid">
              {starsData.map((star, i) => (
                <div key={i} className="landing__star-card">
                  <div className="landing__star-card-top">
                    <span className="landing__star-position">{star.label}</span>
                    <span className="landing__star-war">+{Number(star.war).toFixed(1)} WAR</span>
                  </div>
                  <h4 className="landing__star-name">
                    {star.bp?.id ? (
                      <Link to={`/jugador/${star.bp.id}`} className="landing__star-link">
                        {star.fullName}
                      </Link>
                    ) : (
                      star.fullName
                    )}
                  </h4>
                  <p className="landing__star-team">
                    {star.teamId ? (
                      <Link to={`/equipo/${star.teamId}`} className="landing__star-link">
                        {star.team}
                      </Link>
                    ) : (
                      star.team
                    )}
                  </p>
                  <div className="landing__star-stats">
                    {starStatRows(star).map((row, j) => (
                      <div className="landing__star-stat" key={j}>
                        <span className="landing__star-stat-label">{row.label}</span>
                        <span className={`landing__star-stat-val${row.amber ? ' landing__star-stat-val--amber' : ''}`}>
                          {row.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PALMARÉS + CALLOUT — fiel al mockup dark/light */}
      {palmares.length > 0 && (
        <section className="landing__palmares">
          <div className="landing__palmares-inner">
            <motion.div
              className="landing__palmares-head"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="landing__palmares-eyebrow">
                Palmarés y Glorias del Béisbol
              </span>
              <h2 className="landing__palmares-title">
                Campeones de las Últimas Temporadas
              </h2>
              <p className="landing__palmares-sub">
                Registro histórico de las Series Finales y sus directores
                técnicos laureados.
              </p>
            </motion.div>

            <div className="landing__palmares-grid">
              {palmares.map((c, i) => {
                const teamId = teamIdByName[c.Equipo];
                const year = c.Temporada || '—';
                const yearClass = [
                  'landing__palmares-year--rose',
                  'landing__palmares-year--amber',
                  'landing__palmares-year--muted',
                  'landing__palmares-year--muted',
                ][i] || 'landing__palmares-year--muted';
                return (
                  <motion.div
                    key={i}
                    className="landing__palmares-card"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="landing__palmares-card-top">
                      <span className={`landing__palmares-year ${yearClass}`}>
                        {year}
                      </span>
                      <span className="landing__palmares-serie">{c.Serie}</span>
                    </div>
                    {teamId ? (
                      <Link
                        to={`/equipo/${teamId}`}
                        className="landing__palmares-team"
                      >
                        {c.Equipo}
                      </Link>
                    ) : (
                      <h4 className="landing__palmares-team">{c.Equipo}</h4>
                    )}
                    <p className="landing__palmares-dt">
                      Dir. Técnico: <span>{c['Director Técnico']}</span>
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Callout DT — banner CTA fiel */}
            <div className="landing__callout">
              <div className="landing__callout-left">
                <div className="landing__callout-ico" aria-hidden="true">
                  <span className="material-symbols-outlined">sports</span>
                </div>
                <div>
                  <h3 className="landing__callout-title">
                    ¿Eres Director Técnico o Anotador Oficial?
                  </h3>
                  <p className="landing__callout-sub">
                    Accede a la plataforma de gestión táctica: cambio de
                    rosters en tiempo real, validación de lineup card 45
                    minutos antes del playball y descarga de reportes oficiales
                    WBSC.
                  </p>
                </div>
              </div>
              <div className="landing__callout-actions">
                {isLogged && role === 'Director Técnico' ? (
                  <Link to="/dt/cambios" className="landing__callout-btn ghost">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      badge
                    </span>
                    Portal de Cambios
                  </Link>
                ) : (
                  <button type="button" onClick={onModalOpen} className="landing__callout-btn ghost">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      badge
                    </span>
                    Portal de Cambios
                  </button>
                )}
                {isLogged && role === 'Admin' ? (
                  <Link to="/admin/posiciones" className="landing__callout-btn solid">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      admin_panel_settings
                    </span>
                    Gestión de Liga (Admin)
                  </Link>
                ) : (
                  <button type="button" onClick={onModalOpen} className="landing__callout-btn solid">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      admin_panel_settings
                    </span>
                    Gestión de Liga (Admin)
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAVORITOS (solo logueados) */}
      {isLogged && <FavoritesPanel />}

      {/* FOOTER 5-COLUMNAS — fiel al mockup (bg #081626) */}
      <footer className="landing__footer">
        <div className="landing__footer-top">
          <div className="landing__footer-brand-col">
            <span className="landing__footer-name">
              Liga Nacional de Béisbol
            </span>
            <p className="landing__footer-tagline">
              Órgano rector y circuito élite del béisbol profesional nacional.
              Plataforma de telemetría, asignaciones oficiales de rosters,
              boxscores en vivo y recopilación estadística certificada para la
              Serie Nacional 2025-2026.
            </p>
            <div className="landing__footer-badges">
              <span className="landing__footer-badge landing__footer-badge--gold">
                Homologación WBSC
              </span>
              <span className="landing__footer-badge landing__footer-badge--slate">
                Radar Statcast Sync
              </span>
            </div>
          </div>

          <div className="landing__footer-col">
            <h4>Competición</h4>
            <ul>
              <li>
                <Link to="/reporte/estadisticas-juegos-por-equipos">
                  Tabla de Posiciones
                </Link>
              </li>
              <li>
                <Link to="/reporte/average">Líderes Ofensivos y Pitcheo</Link>
              </li>
              <li>
                <Link to="/consultas/Series">Calendario de Temporada</Link>
              </li>
              <li>
                <Link to="/comparar">Comparador de Peloteros</Link>
              </li>
              <li>
                <Link to="/consultas/Game">Cuadro de Play-Offs</Link>
              </li>
            </ul>
          </div>

          <div className="landing__footer-col">
            <h4>Reportes Oficiales</h4>
            <ul>
              <li>
                <Link to="/reporte/equipos-ganadores">
                  Anotaciones Certificadas
                </Link>
              </li>
              <li>
                <Link to="/reporte/jugadores-estrellas">Altas y Bajas Semanales</Link>
              </li>
              <li>
                <Link to="/reporte/carreras-limpias-juegos-ganados">
                  Reglamento de Campeonato 2025
                </Link>
              </li>
              <li>
                <Link to="/reporte/efectividad-por-posicion">
                  Protocolo Antidopaje
                </Link>
              </li>
              <li>
                <Link to="/reporte/jugadores-de-un-equipo">
                  API Pública de Estadísticas
                </Link>
              </li>
            </ul>
          </div>

          <div className="landing__footer-col">
            <h4>Portales Técnicos</h4>
            <ul>
              <li>
                <Link to="/dt/cambios">Portal Directores Técnicos</Link>
              </li>
              <li>
                <Link to="/dt/listar-cambios">Mesa de Control y Anotadores</Link>
              </li>
              <li>
                <Link to="/consultas/Team">Comisión de Arbitraje</Link>
              </li>
              <li>
                <Link to="/consultas/Worker">Sala de Prensa y Acreditaciones</Link>
              </li>
              <li>
                <button type="button" className="landing__footer-link" onClick={onRegisterOpen}>
                  Federación Deportiva Nacional
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing__footer-bottom">
          <span className="landing__footer-copy">
            © 2025-2026 Liga Nacional de Béisbol. Todos los derechos reservados.
          </span>
          <div className="landing__footer-legal">
            <a href="/registro" className="landing__footer-legal-link">Términos de Uso</a>
            <a href="/registro" className="landing__footer-legal-link">Política de Privacidad</a>
            <a href="/registro" className="landing__footer-legal-link">Auditoría de Datos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
