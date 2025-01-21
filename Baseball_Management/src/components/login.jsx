import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'; 

function LoginBoard({ name, isLogged, setLogin, onButtonClick, NameOnChange, updateRole }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teamId, setTeamId] = useState(null);
    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Estado para manejar la visibilidad de la contraseña
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const savedRoleName = localStorage.getItem('role_name') || '';
        setRoleName(savedRoleName);
    }, []);

    const handleLogin = async () => {
        setErrorMessage('');  // Resetear errores previos

        try {
            const response = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
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

            setTeamId(team_id);
            setRoleName(role_name);
            setPermissions(user.permissions);
            updateRole(role_name);  // Actualiza el rol en App.js
            NameOnChange(email);
            setLogin(true);  // Actualiza isLogged en App.js
            onButtonClick();  // Llama a la función pasada como prop para cambiar el estado en el padre
            
            // Redirige a /admin si el rol es Admin 
            if (role_name === 'Admin') { navigate('/admin-dashboard'); }
        } 
        catch (error) {
            console.error('Error capturado:', error.message);
            setErrorMessage(error.message);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        onButtonClick();  // Llama a la función pasada como prop para cambiar el estado en el padre
        updateRole('Guest');  // Resetea el rol en App.js
        NameOnChange('');
        setLogin(false);  // Actualiza isLogged en App.js
        navigate('/');
        window.location.reload();  // Recarga la página
    };

    // Función para alternar la visibilidad de la contraseña
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-board">
            {!isLogged ? (
                <div className="form-container">
                    <div className="form-group">
                        <label>Email: </label>
                        <input 
                            type="text" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña: </label>
                        <div className="password-container">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <button 
                                type="button" 
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogin} 
                        className="login-button"
                    >
                        Iniciar sesión
                    </button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            ) : (
                <div className="form-container">
                    <p>Bienvenido, <strong>{roleName}</strong></p>
                    {/* {teamId ? ` - Equipo ID: ${teamId}` : ' - Sin equipo asignado'} */}
                    <p>Permisos: {permissions.join(", ")}</p>
                    <button 
                        onClick={handleLogout} 
                        className="logout-button"
                    >
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
}

export default LoginBoard;
