// Wrappers de vistas que renderizan el componente correcto según el parámetro
// de la ruta URL (atrevido a lo que mapeaba el estado selectedOption).

import { useParams } from 'react-router-dom';
import { CRUD_ROUTES, REPORT_ROUTES } from './routes';

import BaseballPlayerCRUD from './components/FormulariosCRUD/BaseballPlayerCRUD';
import BPParticipationCRUD from './components/FormulariosCRUD/BPParticipationCRUD';
import DirectionTeamCRUD from './components/FormulariosCRUD/DirectionTeamCRUD';
import GameCRUD from './components/FormulariosCRUD/GameCRUD';
import LineUpCRUD from './components/FormulariosCRUD/LineUpCRUD';
import PersonCRUD from './components/FormulariosCRUD/PersonCRUD';
import PitcherCRUD from './components/FormulariosCRUD/PitcherCRUD';
import PlayerInLineUpCRUD from './components/FormulariosCRUD/PlayerInLineUpCRUD';
import PlayerInPositionCRUD from './components/FormulariosCRUD/PlayerInPositionCRUD';
import PlayerSwapCRUD from './components/FormulariosCRUD/PlayerSwapCRUD';
import PositionCRUD from './components/FormulariosCRUD/PositionCRUD';
import ScoreCRUD from './components/FormulariosCRUD/ScoreCRUD';
import SeasonCRUD from './components/FormulariosCRUD/SeasonCRUD';
import SeriesCRUD from './components/FormulariosCRUD/SeriesCRUD';
import StarPlayerCRUD from './components/FormulariosCRUD/StarPlayerCRUD';
import TeamCRUD from './components/FormulariosCRUD/TeamCRUD';
import TeamOnTheFieldCRUD from './components/FormulariosCRUD/TeamOnTheFieldCRUD';
import TechnicalDirectorCRUD from './components/FormulariosCRUD/TechnicalDirectorCRUD';
import UserCRUD from './components/FormulariosCRUD/UserCRUD';
import WorkerCRUD from './components/FormulariosCRUD/WorkerCRUD';
import ReportComponent from './components/report';
import Queries from './components/Queries';

const CRUD_COMPONENTS = {
  Posiciones: PositionCRUD,
  Usuarios: UserCRUD,
  Temporadas: SeasonCRUD,
  Trabajadores: WorkerCRUD,
  Equipos: TeamCRUD,
  Alineaciones: LineUpCRUD,
  Personas: PersonCRUD,
  Jugadores: BaseballPlayerCRUD,
  'Directores Técnicos': TechnicalDirectorCRUD,
  'Jugadores en Alineación': PlayerInLineUpCRUD,
  'BP Participations': BPParticipationCRUD,
  'Equipos en el Campo': TeamOnTheFieldCRUD,
  Puntuaciones: ScoreCRUD,
  Juegos: GameCRUD,
  Pitchers: PitcherCRUD,
  'Jugadores Estrella': StarPlayerCRUD,
  'Jugadores en Posición': PlayerInPositionCRUD,
  'Intercambios de Jugadores': PlayerSwapCRUD,
  Series: SeriesCRUD,
  'Direction Team': DirectionTeamCRUD,
};

export function CRUDRoute() {
  const { slug } = useParams();
  const option = CRUD_ROUTES[slug];
  const Component = CRUD_COMPONENTS[option];
  return Component ? <Component /> : <div>Entidad no encontrada</div>;
}

export function ReportRoute() {
  const { slug } = useParams();
  const cfg = REPORT_ROUTES[slug];
  return cfg ? (
    <ReportComponent report_id={cfg.reportId} report_name={cfg.name} />
  ) : (
    <div>Reporte no encontrado</div>
  );
}

export function QueryRoute() {
  const { tabla } = useParams();
  return <Queries selectedTable={tabla} />;
}
