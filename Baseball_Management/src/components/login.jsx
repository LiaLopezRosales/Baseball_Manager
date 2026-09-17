import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import { REDIRECT_AFTER_LOGIN_KEY } from '../authModal';
import './login.css';

function LoginBoard({
  setLogin,
  NameOnChange,
  updateRole,
  updateTeam,
  onClose,
  onSwitchToRegister,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error('Error en el formato de la respuesta del servidor');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      const { token, team_id, role_name, user } = data;

      localStorage.setItem('token', token);
      localStorage.setItem('team_id', team_id);
      localStorage.setItem('role_name', role_name);
      localStorage.setItem('permissions', JSON.stringify(user.permissions));

      updateTeam(team_id);
      updateRole(role_name);
      const displayName = email.split('@')[0];
      NameOnChange(displayName);
      localStorage.setItem('userName', displayName);
      localStorage.setItem('isLogged', 'true');
      setLogin(true);
      onClose?.();

      const redirect = localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
      localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
      if (redirect) navigate(redirect);
      else if (role_name === 'Director Técnico') navigate('/dt/cambios');
      else navigate('/');
    } catch (error) {
      console.error('Error capturado:', error.message);
      setErrorMessage(error.message);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((s) => !s);

  return (
    <div className="auth-board">
      <div className="auth-card">
        <div className="auth-overline">
          <span className="auth-overline__dot" />
          LNB Pro · Plataforma Oficial
        </div>

        <h2 className="auth-title">Iniciar Sesión</h2>
        <p className="auth-subtitle">
          Accede con tu cuenta oficial para seguir a tus equipos favoritos, consultar estadísticas en vivo y recibir las noticias exclusivas de la liga.
        </p>

        <div className="auth-field">
          <label className="auth-label">Correo Electrónico</label>
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

        <div className="auth-field">
          <label className="auth-label">Contraseña</label>
          <div className="auth-input-wrap">
            <span className="material-symbols-outlined auth-input-icon">lock</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input auth-input--with-eye"
              placeholder="••••••••"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="auth-eye"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        <button onClick={handleLogin} className="auth-submit">
          <span>Iniciar Sesión</span>
          <span className="material-symbols-outlined">login</span>
        </button>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <p className="auth-switch">
          ¿No tienes cuenta?
          <button className="auth-switch-btn" onClick={onSwitchToRegister}>
            Crear cuenta <span className="material-symbols-outlined">person_add</span>
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginBoard;