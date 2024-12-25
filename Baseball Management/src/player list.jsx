import React, { useState } from 'react';
import Foto from './Cuddly_Flying_Spaghetti_Monster.jpg'

function Player({ Name, Team, ID }) {

    const name = Name
    const team = Team

    return (
        //Los textos se pueden salir de los límites
        //Acomodar bien la foto
        <div className='pelotero' style={{ position:'relative'}}>
            <p style = {{ fontSize:16, textAlign: 'left'}}>Player Name: {name}</p>
            <p style = {{ fontSize:16, textAlign: 'left'}}>Player Team: {team}</p>
            
            <div style = {{ textAlign: 'right'}}>
                <img src={Foto} alt="Portrait: Not Available" style = {{ position:'absolute', top: '30%', right: 8}} width={50} height={50}/>    
            </div>
        </div>
    );
}

function PlayerList({ logged }) {
    const [array, setArray] = useState([]);
    const [name, setName] = useState();
    const [team, setTeam] = useState();

    // const list = array.map( x =>
    //     <li key={x.ID}>
    //         {x}
    //     </li>
    // )

    const NameOnChange = (event) => {
        setName(event.target.value)
    }

    const TeamOnChange = (event) => {
        setTeam(event.target.value)
    }

    const CreatePlayer = () => {
        if (!logged) {
            return
        }
        
        const copy = array.slice()
        copy.push(<Player Name={name} Team={team}/>)
        
        setArray(copy)
    }
    
    //Puedo hacer un componente aparte para el formulario
    //Spoiler: HAY que tragarse los formularios para enlazar esto con la BD
    
    return(
        <div>
            {/* <form action=""> */}
                <label htmlFor="">Player name: </label>
                <input type="text" name="Player name" value={name} onChange={NameOnChange} /> <br />
                <label htmlFor="">Player team: </label>
                <input type="text" name="Player team" value={team} onChange={TeamOnChange} /> <br />
                <button onClick={CreatePlayer}> Save Player </button>
                <p hidden={logged} style={{color: 'red'}}>Must login first</p>
            {/* </form> */}

            <p>{array}</p>

            {/* {list} */}
        </div>
    ) 
}

export default PlayerList;