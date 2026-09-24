import { useState } from 'react';
import LandingHeader from '../landing/LandingHeader';
import LandingFooter from '../landing/LandingFooter';
import { getInitialTheme } from '../../theme';
import './infoPages.css';

// Shell público de las páginas informativas: header sticky de la landing,
// hero con eyebrow/título/lead, cuerpo y footer 5-columnas.
function InfoLayout({
  isLogged,
  userName,
  role,
  onModalOpen,
  onRegisterOpen,
  onLogout,
  eyebrow,
  title,
  lead,
  children,
}) {
  const [theme, setTheme] = useState(() => getInitialTheme());

  return (
    <div className="landing inf" data-theme={theme}>
      <LandingHeader
        isLogged={isLogged}
        userName={userName}
        role={role}
        onModalOpen={onModalOpen}
        onRegisterOpen={onRegisterOpen}
        onLogout={onLogout}
        theme={theme}
        onThemeChange={setTheme}
        onNameChange={() => {}}
      />

      <main className="inf__main">
        <div className="inf__hero">
          {eyebrow && <span className="inf__eyebrow">{eyebrow}</span>}
          <h1 className="inf__title">{title}</h1>
          {lead && <p className="inf__lead">{lead}</p>}
        </div>

        <div className="inf__body">{children}</div>
      </main>

      <LandingFooter />
    </div>
  );
}

export default InfoLayout;
