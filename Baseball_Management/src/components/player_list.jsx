import React, { useState } from 'react';
import Foto from './Cuddly_Flying_Spaghetti_Monster.jpg';
import './player_list.css';  // Importa el archivo CSS

function Player({ Name, Team, ID }) {

    const name = Name;
    const team = Team;

    return (
        <div className='pelotero' style={{ position: 'relative' }}>
            <p style={{ fontSize: 16, textAlign: 'left' }}>Player Name: {name}</p>
            <p style={{ fontSize: 16, textAlign: 'left' }}>Player Team: {team}</p>

            <div style={{ textAlign: 'right' }}>
                <img src={Foto} alt="Portrait: Not Available" style={{ position: 'absolute', top: '30%', right: 8 }} width={50} height={50} />
            </div>
        </div>
    );
}

function PlayerList({ logged }) {
    const [array, setArray] = useState([]);
    const [name, setName] = useState();
    const [team, setTeam] = useState();

    const NameOnChange = (event) => {
        setName(event.target.value);
    }

    const TeamOnChange = (event) => {
        setTeam(event.target.value);
    }

    const CreatePlayer = () => {
        if (!logged) {
            return;
        }

        const copy = array.slice();
        copy.push(<Player Name={name} Team={team} />);

        setArray(copy);
    }

    return (
        <div className='player-list-container'>
            <div className='form-container'>
                <label htmlFor="">Player name: </label>
                <input type="text" name="Player name" value={name} onChange={NameOnChange} /> <br />
                <label htmlFor="">Player team: </label>
                <input type="text" name="Player team" value={team} onChange={TeamOnChange} /> <br />
                <button onClick={CreatePlayer}>Save Player</button>
                <p hidden={logged} style={{ color: 'red' }}>Must login first</p>
            </div>

            <div className='player-cards'>
                {array}
            </div>
        </div>
    )
}

export default PlayerList;
