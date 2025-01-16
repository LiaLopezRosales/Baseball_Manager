import React, { useState } from 'react';
import './login.css';  // Asegúrate de que el archivo CSS correcto se importe

function LoginBoard() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogged, setIsLogged] = useState(false);
    const [teamId, setTeamId] = useState(null);
    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

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
            setIsLogged(true);
        } 
        catch (error) {
            console.error('Error capturado:', error.message);
            setErrorMessage(error.message);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsLogged(false);
    };

    return (
        <div className="login-board">
            {!isLogged ? (
                <div className="form-container">
                    <div className="form-group">
                        <label>Email: </label>
                        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Contraseña: </label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button onClick={handleLogin}>Iniciar sesión</button>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                </div>
            ) : (
                <div>
                    <p>
                        Bienvenido, <strong>{roleName}</strong> 
                        {teamId ? ` - Equipo ID: ${teamId}` : ' - Sin equipo asignado'}
                    </p>
                    <p>Permisos: {permissions.join(", ")}</p>
                    <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
            )}
        </div>
    );
}

export default LoginBoard;
