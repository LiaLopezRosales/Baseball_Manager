import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const fmtAvg = (v) =>
  v !== undefined && v !== null ? v.toFixed(3).slice(1) : '.000';

function LandingHero({ label, leader, totalPlayed, metrics, theme = 'dark' }) {
  const chip = typeof totalPlayed === 'number' ? `J-${totalPlayed}` : 'J-0';
  const topB = metrics?.topBateo?.promedio;
  const liga = metrics?.promedioLiga;
  const franquicias = metrics?.franquicias;

  return (
    <section className="landing__hero">
      {/* Capas de fondo: foto → scrim → patrón → luces → marca de agua */}
      <div className="landing__hero-bg" aria-hidden="true">
        <img
          className="landing__hero-texture"
          src={`/img/landing-hero-${theme}.webp`}
          alt=""
          loading="eager"
        />
        <div className="landing__hero-scrim" />
        <div className="landing__hero-pattern" />
        <div className="landing__hero-glow" />
        <div className="landing__hero-watermark" aria-hidden="true">
          <svg viewBox="0 0 360 360" width="360" height="360" fill="none">
            <path
              d="M20 220 L180 110 L340 220 L180 330 Z"
              stroke="currentColor"
              strokeWidth="26"
              strokeLinejoin="round"
              opacity="0.14"
            />
            <path
              d="M20 220 L180 330 L340 220 L180 110 Z"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinejoin="round"
              opacity="0.2"
            />
            <circle cx="180" cy="220" r="10" fill="currentColor" opacity="0.3" />
            <path
              d="M180 128 L180 96"
              stroke="currentColor"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.28"
            />
          </svg>
        </div>
      </div>

      <div className="landing__hero-inner">
        <div className="landing__hero-copy">
          <motion.div {...fade(0)} className="landing__hero-eyebrow">
            <span className="landing__live-badge">
              <span className="landing__live-dot" aria-hidden="true" />
              LIVE BROADCAST SYNC
            </span>
            <span className="landing__hero-chip">TEMP. REGULAR • {chip}</span>
          </motion.div>

          <motion.h1 {...fade(0.06)} className="landing__hero-title">
            <strong>LIGA NACIONAL</strong>
            <br />
            <span className="landing__hero-title-accent">DE BÉISBOL</span>
          </motion.h1>

          <motion.p {...fade(0.12)} className="landing__hero-lede">
            Circuito élite y plataforma oficial de gestión deportiva:
            telemetría, asignación de rosters, calendario de la Serie Nacional
            2025-2026 y reportes oficiales certificados, con datos reales de la
            liga en cada métrica.
          </motion.p>

          <motion.div {...fade(0.18)} className="landing__hero-cta">
            <Link to="/registro" className="landing__btn landing__btn--solid">
              <span className="material-symbols-outlined" aria-hidden="true">
                how_to_reg
              </span>
              Registrarse Gratis
            </Link>
            <Link
              to="/reporte/equipos-ganadores"
              className="landing__btn landing__btn--ghost"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                query_stats
              </span>
              Explorar Reportes Oficiales
            </Link>
          </motion.div>

          <motion.div {...fade(0.24)} className="landing__hero-metrics">
            <div className="landing__metric">
              <span className="landing__metric-value">
                {franquicias ?? '—'}
              </span>
              <span className="landing__metric-label">Franquicias</span>
            </div>
            <div className="landing__metric landing__metric--gold">
              <span className="landing__metric-value">{fmtAvg(topB)}</span>
              <span className="landing__metric-label">Top Bateo</span>
            </div>
            <div className="landing__metric landing__metric--emerald">
              <span className="landing__metric-value">{fmtAvg(liga)}</span>
              <span className="landing__metric-label">Promedio de la Liga</span>
            </div>
          </motion.div>
        </div>

        <motion.div {...fade(0.16)} className="landing__hero-card">
          {leader ? (
            <>
              <div className="landing__hero-card-top">
                <span className="landing__hero-card-chip">
                  LÍDER DE LA TEMPORADA
                  {label ? ` ${label}` : ''}
                </span>
                <span className="landing__hero-card-streak">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    bolt
                  </span>
                  RACHA: {leader.streak}
                </span>
              </div>

              <div className="landing__hero-card-team">
                <div className="landing__avatar">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    sports_baseball
                  </span>
                </div>
                <div>
                  <h3 className="landing__hero-card-name">
                    {leader.Equipo || leader.name}
                  </h3>
                  <p className="landing__hero-card-dt">
                    División {leader.division || 'Liga'} • Dir. Técnico: {' '}
                    <span>{leader.dt || '—'}</span>
                  </p>
                </div>
              </div>

              <div className="landing__hero-card-stats">
                <div className="landing__stat">
                  <span>Récord</span>
                  <strong>
                    {leader.jg ?? 0}–{leader.jp ?? 0}
                  </strong>
                </div>
                <div className="landing__stat">
                  <span>PCT</span>
                  <strong>{leader.pctStr ?? '—'}</strong>
                </div>
                <div className="landing__stat">
                  <span>DIF</span>
                  <strong>{leader.dif != null ? leader.dif : '—'}</strong>
                </div>
              </div>

              <div className="landing__hero-card-meta">
                <div className="landing__hero-card-meta-row">
                  <span>Anotadas / Permitidas</span>
                  <span className="landing__hero-card-meta-val">
                    {leader.runsFor ?? '—'} / {leader.runsAgainst ?? '—'}
                  </span>
                </div>
                <div className="landing__hero-card-meta-row">
                  <span>Últimos 10 Juegos</span>
                  <span className="landing__hero-card-meta-val">
                    {leader.last10 ?? '—'}
                  </span>
                </div>
              </div>

              {leader.id && (
                <Link
                  to={`/equipo/${leader.id}`}
                  className="landing__btn landing__btn--solid landing__hero-card-btn"
                >
                  Ver Perfil de Equipo
                  <span className="material-symbols-outlined" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
              )}
            </>
          ) : (
            <p className="landing__hero-card-empty">
              Recopilando posición de líder…
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default LandingHero;