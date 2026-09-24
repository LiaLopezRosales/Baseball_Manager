// Contenido de las páginas informativas públicas de la liga.
// Nota: son páginas de reemplazo temporal; el contenido es ficticio de
// demostración y así se advierte al pie de cada una (disclaimer).

export const INFO_DISCLAIMER =
  'Contenido ficticio de demostración. Página temporal de reemplazo; el contenido oficial la sustituirá.';

export const INFO_PAGES = {
  '/reglamento': {
    eyebrow: 'Institucional · Serie Nacional 2025-2026',
    title: 'Reglamento Técnico de Series Oficiales',
    lead: 'Marco normativo que rige la competición oficial del circuito: formato de liga, reglas de juego, puntuación, criterios de clasificación y régimen disciplinario.',
    sections: [
      {
        heading: 'Formato de la liga',
        paragraphs: [
          'La Serie Nacional se disputa bajo un formato de temporada regular con round-robin entre las franquicias del circuito, seguido de una fase de play-offs eliminatoria.',
          'Cada franquicia disputa un calendario equilibrado de series de fin de semana, con jornadas dobles los sábados y partidos de cierre los domingos.',
        ],
        list: [
          'Temporada regular: 240 juegos oficiales en total.',
          'Clasificación a play-offs: los cuatro primeros equipos de la tabla general.',
          'Ronda final: serie al mejor de siete encuentros.',
        ],
      },
      {
        heading: 'Reglas de juego',
        paragraphs: [
          'El juego se rige por las Reglas Oficiales del Béisbol homologadas por la WBSC, con las adaptaciones locales aprobadas por la Dirección de Competición.',
          'Se aplica la regla de bateador designado en todas las categorías y el uso de revisión por video en jugadas decisivas durante los play-offs.',
        ],
      },
      {
        heading: 'Puntuación y desempates',
        paragraphs: [
          'La tabla de posiciones se ordena por porcentaje de juegos ganados. En caso de empate, se aplican los siguientes criterios de desempate de forma sucesiva:',
        ],
        list: [
          'Récord particular entre los equipos empatados.',
          'Diferencia de carreras anotadas y permitidas.',
          'Mejor efectividad colectiva de pitcheo.',
          'Sorteo público ante la Comisión de Competición.',
        ],
      },
      {
        heading: 'Disciplina',
        paragraphs: [
          'La Comisión Disciplinaria evalúa las conductas antideportivas, el uso de sustancias prohibidas y las protestas formales presentadas por las franquicias.',
          'Las sanciones se gradúan en amonestación, suspensión de juegos y multa, y son apelables ante el Comité de Apelaciones dentro de los cinco días hábiles siguientes.',
        ],
      },
    ],
  },

  '/protocolo-antidopaje': {
    eyebrow: 'Institucional · Integridad deportiva',
    title: 'Protocolo Antidopaje',
    lead: 'Política antidopaje de la liga alineada con los estándares internacionales: sustancias y métodos prohibidos, controles y régimen de sanciones.',
    sections: [
      {
        heading: 'Sustancias y métodos prohibidos',
        paragraphs: [
          'El listado de sustancias y métodos prohibidos se adopta anualmente del estándar internacional vigente y se publica antes del inicio de cada temporada.',
          'Incluye agentes anabolizantes, hormonas peptídicas, beta-2 agonistas, diuréticos y métodos como la manipulación de muestras.',
        ],
      },
      {
        heading: 'Controles',
        paragraphs: [
          'Los controles pueden ser en competición o fuera de competición y son notificados por un oficial de control designado.',
          'Cada muestra se divide en A y B; el análisis de la muestra B solo procede a solicitud del deportista cuando la muestra A resulta adversa.',
        ],
        list: [
          'Controles aleatorios por sorteo entre los equipos de cada serie.',
          'Controles dirigidos ante indicios o resultados atípicos.',
          'Controles de pasaporte biológico para deportistas de alto rendimiento.',
        ],
      },
      {
        heading: 'Sanciones',
        paragraphs: [
          'La primera infracción por sustancia prohibida se sanciona con suspensión de hasta cuatro años y la anulación de los resultados obtenidos desde la fecha de la infracción.',
        ],
      },
    ],
  },

  '/comision-arbitraje': {
    eyebrow: 'Institucional · Cuerpo arbitral',
    title: 'Comisión de Arbitraje',
    lead: 'Reglas de arbitraje del circuito y procedimiento oficial para la presentación de protestas e impugnaciones.',
    sections: [
      {
        heading: 'Cuerpo arbitral',
        paragraphs: [
          'La Comisión de Arbitraje es el órgano responsable de la designación, evaluación y formación continua de los árbitros oficiales de la liga.',
          'Cada serie cuenta con un árbitro principal, árbitros de base y un anotador oficial certificado.',
        ],
      },
      {
        heading: 'Protestas e impugnaciones',
        paragraphs: [
          'Las protestas deben presentarse por escrito al anotador oficial antes de que concluya el partido, indicando la regla que se considera infringida.',
        ],
        list: [
          'La Comisión resuelve dentro de las 48 horas siguientes al encuentro.',
          'Las decisiones sobre hechos de juego son inapelables.',
          'Las decisiones de interpretación reglamentaria admiten recurso ante el Comité de Apelaciones.',
        ],
      },
      {
        heading: 'Evaluación',
        paragraphs: [
          'Cada actuación arbitral se evalúa mediante un informe técnico que alimenta el escalafón interno y determina la designación en play-offs.',
        ],
      },
    ],
  },

  '/sala-prensa': {
    eyebrow: 'Institucional · Comunicación',
    title: 'Sala de Prensa y Acreditaciones',
    lead: 'Requisitos y canales oficiales para la acreditación de medios de comunicación y el acceso a la información de la liga.',
    sections: [
      {
        heading: 'Acreditación de prensa',
        paragraphs: [
          'La acreditación habilita el acceso a la sala de prensa, a las zonas mixtas y a los materiales oficiales de cada serie.',
        ],
        list: [
          'Solicitud previa con carta del medio y datos del profesional.',
          'Fotografía reciente y documento de identidad vigente.',
          'Plazo de solicitud: hasta 72 horas antes del inicio de cada serie.',
        ],
      },
      {
        heading: 'Canales oficiales',
        paragraphs: [
          'Los comunicados oficiales, las notas de prensa y los datos estadísticos certificados se publican en el portal de transparencia de la liga.',
          'La Sala de Prensa atiende consultas por correo electrónico en horario laboral y coordina las ruedas de prensa de los equipos.',
        ],
      },
      {
        heading: 'Normas de conducta',
        paragraphs: [
          'El acceso acreditado implica el compromiso de difundir información verificada y de respetar las zonas restringidas y los derechos de imagen de los deportistas.',
        ],
      },
    ],
  },

  '/federacion': {
    eyebrow: 'Institucional · Órgano rector',
    title: 'Federación Deportiva Nacional',
    lead: 'Órgano rector del béisbol profesional nacional: misión, estructura y programas de desarrollo del deporte.',
    sections: [
      {
        heading: 'Misión',
        paragraphs: [
          'Promover, organizar y regular la práctica del béisbol en todo el territorio nacional, garantizando la integridad de la competición y el desarrollo de los deportistas.',
        ],
      },
      {
        heading: 'Estructura',
        list: [
          'Asamblea General de Clubes.',
          'Junta Directiva.',
          'Comisión Técnica y de Competición.',
          'Dirección de Desarrollo y Cantera.',
          'Comisión de Integridad y Disciplina.',
        ],
      },
      {
        heading: 'Programas',
        paragraphs: [
          'La Federación impulsa academias de formación, programas de reclutamiento juvenil y planes de capacitación para entrenadores y árbitros.',
        ],
      },
    ],
  },

  '/api-publica': {
    eyebrow: 'Datos abiertos · Desarrolladores',
    title: 'API Pública de Estadísticas',
    lead: 'Documentación ilustrativa de los endpoints públicos de consulta estadística de la liga, disponibles para análisis y reutilización.',
    sections: [
      {
        heading: 'Reportes oficiales',
        paragraphs: [
          'Los reportes se consultan mediante el endpoint de reportes, recibiendo un identificador de reporte como parámetro.',
        ],
        list: [
          'GET /api/queries/reports/?report_id=N — reporte oficial certificado.',
          'Campeones por temporada, líderes de bateo, estadísticas por equipo y más.',
        ],
      },
      {
        heading: 'Consultas dinámicas',
        paragraphs: [
          'El endpoint de filtrado dinámico permite seleccionar columnas y aplicar filtros por campo sobre las tablas públicas del padrón.',
        ],
        list: [
          'POST /api/queries/dinamic-filter/ — consulta filtrada de una tabla.',
          'Cuerpo: { table_name, fields, filters }.',
        ],
      },
      {
        heading: 'Condiciones de uso',
        paragraphs: [
          'El uso de los datos implica la cita de la fuente. Los datos personales y de acceso no se exponen a través de la API pública.',
        ],
      },
    ],
  },

  '/playoffs': {
    eyebrow: 'Competición · Ronda final',
    title: 'Cuadro de Play-Offs',
    lead: 'Estructura de la fase final del campeonato: llaves, formato de series y camino hacia el título.',
    sections: [
      {
        heading: 'Formato de llaves',
        paragraphs: [
          'Los cuatro mejores equipos de la temporada regular acceden a la ronda final, que se disputa en series eliminatorias al mejor de siete encuentros.',
        ],
        list: [
          'Semifinal 1: 1.º vs 4.º de la tabla general.',
          'Semifinal 2: 2.º vs 3.º de la tabla general.',
          'Final: ganadores de cada semifinal.',
        ],
      },
      {
        heading: 'Ventaja de localía',
        paragraphs: [
          'El equipo mejor clasificado ejerce la localía en los dos primeros juegos, el quinto y el séptimo de cada serie.',
        ],
      },
      {
        heading: 'Calendario',
        paragraphs: [
          'Las fechas y horarios definitivos de la ronda final se publican una vez confirmados los clasificados, a través del calendario oficial.',
        ],
      },
    ],
  },

  '/terminos': {
    eyebrow: 'Legal · Uso del sitio',
    title: 'Términos de Uso',
    lead: 'Condiciones generales de acceso y uso del portal oficial y de los servicios digitales de la liga.',
    sections: [
      {
        heading: 'Aceptación',
        paragraphs: [
          'El acceso y uso de este portal implica la aceptación plena de estos términos. Si no está de acuerdo con ellos, debe abstenerse de utilizar los servicios.',
        ],
      },
      {
        heading: 'Uso permitido',
        list: [
          'Consultar información oficial y estadísticas de la competición.',
          'Crear una cuenta personal para acceder a funcionalidades adicionales.',
          'Compartir contenidos citando la fuente oficial.',
        ],
      },
      {
        heading: 'Limitación de responsabilidad',
        paragraphs: [
          'La liga no garantiza la disponibilidad ininterrumpida del servicio ni se responsabiliza por el uso indebido de la información publicada.',
        ],
      },
    ],
  },

  '/privacidad': {
    eyebrow: 'Legal · Protección de datos',
    title: 'Política de Privacidad',
    lead: 'Información sobre el tratamiento de datos personales de los usuarios del portal oficial de la liga.',
    sections: [
      {
        heading: 'Datos recopilados',
        list: [
          'Datos de registro: nombre, apellido y correo electrónico.',
          'Datos de uso: preferencias, equipos y jugadores favoritos.',
          'Datos técnicos: identificadores de sesión y registro de actividad.',
        ],
      },
      {
        heading: 'Finalidad',
        paragraphs: [
          'Los datos se utilizan para gestionar el acceso a las funcionalidades del portal, personalizar la experiencia y enviar notificaciones relacionadas con la competición.',
        ],
      },
      {
        heading: 'Derechos',
        paragraphs: [
          'El usuario puede solicitar el acceso, la rectificación o la supresión de sus datos personales a través de los canales de contacto habilitados.',
        ],
      },
    ],
  },
};
