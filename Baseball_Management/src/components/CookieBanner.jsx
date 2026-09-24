import { useState } from 'react';
import { Link } from 'react-router-dom';
import './cookieBanner.css';

const CONSENT_KEY = 'cookie_consent';

function CookieBanner() {
  const [consent, setConsent] = useState(() => {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch {
      return 'accepted';
    }
  });

  if (consent) return null;

  const decide = (value) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* almacenamiento no disponible: no mostrar de nuevo */
    }
    setConsent(value);
  };

  return (
    <div className="ckb" role="region" aria-label="Aviso de privacidad y cookies">
      <p className="ckb__text">
        Usamos cookies propias y almacenamiento local (tema, sesión y
        preferencias) para el funcionamiento del sitio y su análisis.
        Consulta nuestra{' '}
        <Link to="/privacidad" className="ckb__link">
          Política de Privacidad
        </Link>
        .
      </p>
      <div className="ckb__actions">
        <button
          type="button"
          className="ckb__btn ckb__btn--ghost"
          onClick={() => decide('rejected')}
        >
          Rechazar
        </button>
        <button
          type="button"
          className="ckb__btn ckb__btn--solid"
          onClick={() => decide('accepted')}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;