import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy } from 'lucide-react';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

function serieLabel(serie) {
  const n = String(Number(serie) || '');
  if (n === '4') return 'SEMIFINAL';
  if (n === '5') return 'FINAL';
  return `SERIE ${n}`;
}

export default function LandingHero({
  serieId,
  label,
  standings,
  standing,
  totalPlayed,
  seriesTotal,
  isLogged,
  onModalOpen,
  champion,
  roundLabel,
}) {
  const leader = standing[0];
  const leaderAvatar = leader
    ? String(leader.equipo || '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => (w[0] || '').toUpperCase())
        .join('')
    : '';

  return (
    <section className="landing__hero" id="formato">
      <picture className="landing__hero-bg" aria-hidden="true">
        <source
          media="(prefers-color-scheme: dark)"
          srcSet="/img/landing-hero-dark.webp"
        />
        <img src="/img/landing-hero-light.webp" alt="" loading="eager" />
      </picture>
      <div className="landing__hero-shade" />

      <div className="landing__hero-inner">
        <motion.div {...fade()} className="landing__hero-copy">
          <span className="landing__eyebrow">
            <Trophy size={14} />
            <span dangerouslySetInnerHTML={{ __html: '&nbsp;' }} />
            {label} — Campeonato, Serie entre los mejores
          </span>
          <h1 className="landing__hero-title">
            Donde el diamante define
            <em> a los mejores</em>
          </h1>
          <p className="landing__hero-lede">
            Seis franquicias, más de 240 duelos por temporada y una sola corona.
            Resultados reales, estadísticas calculadas y campeones con historia.
          </p>

          <div className="landing__hero-cta">
            {isLogged ? (
              <Link to="/reporte/posiciones" className="landing__btn landing__btn--solid">
                Ver posiciones <ArrowRight size={16} />
              </Link>
            ) : (
              <button
                type="button"
                className="landing__btn landing__btn--solid"
                onClick={onModalOpen}
              >
                Inicia sesión y sigue tu liga <ArrowRight size={16} />
              </button>
            )}
            <a href="#formato" className="landing__btn landing__btn--ghost">
              Ver formato
            </a>
          </div>
        </motion.div>

        <motion.div {...fade(0.1)} className="landing__hero-card">
          {leader ? (
            <>
              <span className="landing__hero-card-tag">LÍDER — {roundLabel}</span>
              <div className="landing__hero-card-team">
                <div className="landing__avatar">{leaderAvatar}</div>
                <div>
                  <h3 className="landing__hero-card-name">{leader.equipo}</h3>
                  <p className="landing__hero-card-dt">Director Técnico</p>
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
                  <strong>{leader.pct ?? '-'}</strong>
                </div>
                <div className="landing__stat">
                  <span>DIF</span>
                  <strong>{leader.dif != null ? leader.dif : '—'}</strong>
                </div>
              </div>
            </>
          ) : (
            <p className="landing__hero-card-empty">Recopilando posición de líder…</p>
          )}

          <div className="landing__hero-card-meta">
            <span>
              <Trophy size={13} /> {totalPlayed} juegos disputados de {seriesTotal}
            </span>
            {!isLogged && (
              <button type="button" className="landing__link" onClick={onModalOpen}>
                Inicia sesión para guardar favoritos
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
