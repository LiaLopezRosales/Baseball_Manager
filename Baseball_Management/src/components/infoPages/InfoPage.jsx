import InfoLayout from './InfoLayout';
import { INFO_DISCLAIMER } from './infoContent';

// Página informativa genérica: recibe el contenido (eyebrow/título/lead/
// secciones) y lo renderiza dentro del shell público con el disclaimer al pie.
function InfoPage({
  content,
  isLogged,
  userName,
  role,
  onModalOpen,
  onRegisterOpen,
  onLogout,
}) {
  const { eyebrow, title, lead, sections = [], disclaimer } = content;

  return (
    <InfoLayout
      isLogged={isLogged}
      userName={userName}
      role={role}
      onModalOpen={onModalOpen}
      onRegisterOpen={onRegisterOpen}
      onLogout={onLogout}
      eyebrow={eyebrow}
      title={title}
      lead={lead}
    >
      <div className="inf__sections">
        {sections.map((section, i) => (
          <section key={i} className="inf__section">
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {section.list && (
              <ul>
                {section.list.map((item, k) => (
                  <li key={k}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="inf__disclaimer">
        <small>{disclaimer || INFO_DISCLAIMER}</small>
      </p>
    </InfoLayout>
  );
}

export default InfoPage;
