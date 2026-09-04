import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogOut, LogIn } from 'lucide-react';
import { API_URL } from '../api';
import ParticleField from './ui/Particles';
import './login.css';

function LoginBoard({
  name,
  isLogged,
  setLogin,
  onButtonClick,
  NameOnChange,
  updateRole,
  updateTeam,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedRoleName = localStorage.getItem('role_name') || '';
    setRoleName(savedRoleName);
  }, []);

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

      setRoleName(role_name);

      updateTeam(team_id);
      updateRole(role_name);
      NameOnChange(email);
      setLogin(true);
      onButtonClick();

      if (role_name === 'Director Técnico') navigate('/dt/cambios');
      else navigate('/');
    } catch (error) {
      console.error('Error capturado:', error.message);
      setErrorMessage(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    onButtonClick();
    updateRole('Guest');
    NameOnChange('');
    updateTeam(null);
    setLogin(false);
    navigate('/');
    window.location.reload();
  };

  const togglePasswordVisibility = () => setShowPassword((s) => !s);

  return (
    <div className="login-board">
      <ParticleField className="login-board__particles" quantity={28} />

      {!isLogged ? (
        <div className="form-container">
          <h2 className="login-title">Iniciar sesión</h2>
          <p className="login-subtitle">Accede a tu cuenta de la plataforma</p>

          <div className="form-group">
            <label className="input-label">Email</label>
            <div className="login-field">
              <Mail size={18} className="login-input-icon" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder="usuario@ejemplo.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Contraseña</label>
            <div className="login-field login-field--password">
              <Lock size={18} className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input login-input--password"
                placeholder="••••••••"
                autoComplete="current-password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="toggle-password"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button onClick={handleLogin} className="login-button">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <LogIn size={18} /> Iniciar sesión
            </span>
          </button>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      ) : (
        <div className="form-container">
          <p className="welcome-message">
            Bienvenido, <strong>{roleName}</strong>
          </p>
          <button onClick={handleLogout} className="logout-button">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <LogOut size={18} /> Cerrar sesión
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default LoginBoard;
