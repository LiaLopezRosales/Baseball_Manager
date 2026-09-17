import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import { REDIRECT_AFTER_LOGIN_KEY } from '../authModal';
import './login.css';

function RegisterBoard({ setLogin, updateRole, updateTeam, NameOnChange, onClose, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setErrorMessage('');

    if (!name.trim() || !lastname.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage('Debes aceptar los Términos de Uso y las Políticas de Privacidad.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), lastname: lastname.trim(), email: email.trim(), password: password.trim() }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Error en el formato de la respuesta del servidor');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      const { token, role_name, user } = data;
      const displayName = `${name.trim().split(' ')[0]} ${lastname.trim().split(' ')[0]}`.trim();

      localStorage.setItem('token', token);
      localStorage.setItem('role_name', role_name);
      localStorage.setItem('permissions', JSON.stringify(user.permissions));
      localStorage.setItem('isLogged', 'true');
      localStorage.setItem('role', role_name);
      localStorage.setItem('userName', displayName);

      updateRole(role_name);
      updateTeam(null);
      NameOnChange(displayName);
      setLogin(true);
      onClose?.();

      const redirect = localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
      localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
      if (redirect) navigate(redirect);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-board">
      <div className="auth-card">
        <div className="auth-overline">
          <span className="auth-overline__dot" />
          LNB Pro · Acceso Aficionados
        </div>

        <h2 className="auth-title">Crear Cuenta</h2>
        <p className="auth-subtitle">
          Crea tu cuenta oficial para seguir a tus equipos favoritos, acceder a estadísticas en vivo y recibir noticias exclusivas de la liga.
        </p>

        <div className="auth-grid2">
          <div className="auth-field">
            <label className="auth-label">
              <span>Nombre</span>
              <span className="auth-label__req">*</span>
            </label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined auth-input-icon">person</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                placeholder="Roberto"
                autoFocus
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">
              <span>Apellidos</span>
              <span className="auth-label__req">*</span>
            </label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined auth-input-icon">badge</span>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="auth-input"
                placeholder="Mendoza Castillo"
              />
            </div>
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label">
            <span>Correo Electrónico</span>
            <span className="auth-label__req">*</span>
          </label>
          <div className="auth-input-wrap">
            <span className="material-symbols-outlined auth-input-icon">mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="tu.correo@ejemplo.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="auth-grid2">
          <div className="auth-field">
            <label className="auth-label">
              <span>Contraseña</span>
              <span className="auth-label__req">*</span>
            </label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined auth-input-icon">lock</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input auth-input--with-eye"
                placeholder="••••••••"
                autoComplete="new-password"
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="auth-eye"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">
              <span>Confirmar Contraseña</span>
              <span className="auth-label__req">*</span>
            </label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined auth-input-icon">lock_reset</span>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input auth-input--with-eye"
                placeholder="••••••••"
                autoComplete="new-password"
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="auth-eye"
                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <span className="material-symbols-outlined">{showConfirm ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
        </div>

        <label className="auth-terms">
          <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
          <span className="auth-checkbox">
            <span className="material-symbols-outlined">check</span>
          </span>
          <span className="auth-terms__text">
            Acepto los <a href="#" onClick={(e) => e.preventDefault()}>Términos de Uso</a> y las <a href="#" onClick={(e) => e.preventDefault()}>Políticas de Privacidad</a> de la LNB Pro.
          </span>
        </label>

        <button onClick={handleRegister} className="auth-submit" disabled={loading}>
          <span>{loading ? 'Registrando...' : 'Registrar Cuenta'}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <p className="auth-switch">
          ¿Ya tienes una cuenta?
          <button className="auth-switch-btn" onClick={onSwitchToLogin}>
            Iniciar sesión <span className="material-symbols-outlined">login</span>
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterBoard;