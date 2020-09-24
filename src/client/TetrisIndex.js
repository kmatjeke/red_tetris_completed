//----------------------------------------------------------------------------------------------------//
//-----------------------------------------Fetching Imports-------------------------------------------//
//----------------------------------------------------------------------------------------------------//

import Tetris from './components/Tetris';
import React from 'react';

const TetrisIndex = () => {
    //splits the url path and then takes the 4th data in the split array
    //which is the #RoomName[PlayerName]
    let room = window.location.href.split('/')[3];
    //passing the room data to the tetris component, and returning the tetris component in a div
    return <div className="App">
        <Tetris room={room} />
    </div>
}
export default TetrisIndex