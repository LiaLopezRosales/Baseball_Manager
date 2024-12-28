// import React, { useState } from 'react';

// function LoginBoard( {name, isLogged, onButtonClick, NameOnChange} ) {
    
//     return (
//         <div>
//             <div hidden={isLogged} >
//                 <label htmlFor="">Name: </label>
//                 <input type="text" name="Player name" value={name} onChange={NameOnChange} /> <br />
//                 <label htmlFor="">Password: </label>
//                 <input type="text" /> <br />
//             </div>
            
//             <button onClick={onButtonClick}> {isLogged ? 'Logout' : 'Login'} </button>
//         </div>
//     )
// }

// export default LoginBoard


import React, { useState } from 'react';

function LoginBoard({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error || 'Error desconocido');
                return;
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            onLoginSuccess(data.user); // Pasar usuario al padre
        } catch (err) {
            setError('Error al conectar con el servidor.');
        }
    };

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <br />
            <label>Contraseña:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <br />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default LoginBoard;