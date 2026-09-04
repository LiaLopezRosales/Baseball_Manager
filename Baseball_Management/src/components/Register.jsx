import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, ArrowLeft } from 'lucide-react';
import { API_URL } from '../api';
import ParticleField from './ui/Particles';
import './register.css';

function Register({ setLogin, updateRole, updateTeam, NameOnChange }) {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setErrorMessage('');

    if (!name.trim() || !lastname.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Todos los campos son obligatorios.');
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

      localStorage.setItem('token', token);
      localStorage.setItem('role_name', role_name);
      localStorage.setItem('permissions', JSON.stringify(user.permissions));
      localStorage.setItem('isLogged', 'true');
      localStorage.setItem('role', role_name);

      updateRole(role_name);
      updateTeam(null);
      NameOnChange(email.trim());
      setLogin(true);
      navigate('/');
      window.location.reload();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <ParticleField className="register-page__particles" quantity={28} />

      <div className="register-card">
        <button className="register-back" onClick={() => navigate('/')} aria-label="Volver al inicio">
          <ArrowLeft size={18} /> Volver
        </button>

        <h2 className="register-title">Crear cuenta</h2>
        <p className="register-subtitle">Regístrate para acceder a funcionalidades exclusivas</p>

        <div className="form-group">
          <label className="input-label">Nombre</label>
          <div className="register-field">
            <User size={18} className="register-input-icon" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="register-input"
              placeholder="Tu nombre"
              autoFocus
            />
          </div>
        </div>

        <div className="form-group">
          <label className="input-label">Apellido</label>
          <div className="register-field">
            <User size={18} className="register-input-icon" />
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="register-input"
              placeholder="Tu apellido"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="input-label">Email</label>
          <div className="register-field">
            <Mail size={18} className="register-input-icon" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="register-input"
              placeholder="usuario@ejemplo.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="input-label">Contraseña</label>
          <div className="register-field register-field--password">
            <Lock size={18} className="register-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-input register-input--password"
              placeholder="••••••••"
              autoComplete="new-password"
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="toggle-password"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button onClick={handleRegister} className="register-button" disabled={loading}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={18} /> {loading ? 'Registrando...' : 'Crear cuenta'}
          </span>
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <p className="register-footer">
          ¿Ya tienes cuenta?{' '}
          <button className="register-link" onClick={() => navigate('/')}>
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
