import React, { useState } from 'react';

function LoginBoard( {name, isLogged, onButtonClick, NameOnChange} ) {
    
    return (
        <div>
            <div hidden={isLogged} >
                <label htmlFor="">Name: </label>
                <input type="text" name="Player name" value={name} onChange={NameOnChange} /> <br />
                <label htmlFor="">Password: </label>
                <input type="text" /> <br />
            </div>
            
            <button onClick={onButtonClick}> {isLogged ? 'Logout' : 'Login'} </button>
        </div>
    )
}

export default LoginBoard