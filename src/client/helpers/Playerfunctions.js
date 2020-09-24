//----------------------------------------------------------------------------------------------------//
//-----------------------------------------Fetching Imports-------------------------------------------//
//----------------------------------------------------------------------------------------------------//

import { checkCollision } from "./gameHelpers";
import { socketEmit } from "../socket";

//----------------------------------------------------------------------------------------------------//
//------------------------------Exporting player movement functions-----------------------------------//
//----------------------------------------------------------------------------------------------------//
export const dropPlayer = (
  setDropTime,
  drop,
  rows,
  level,
  player,
  stage,
  setLevel,
  updatePlayerPos,
  setGameOver,
  mainSocket,
  start,
  setStart,
  setPlayer
) => {
  setDropTime(null);
  drop(
    rows,
    level,
    player,
    stage,
    setLevel,
    setDropTime,
    updatePlayerPos,
    setGameOver,
    mainSocket,
    start,
    setStart,
    setPlayer
  );
};

//drop function which will first check if we will collide when we drop.
//also updates the drop time to the current level drop time everytime drop is called
export const drop = (
  rows,
  level,
  player,
  stage,
  setLevel,
  setDropTime,
  updatePlayerPos,
  setGameOver,
  mainSocket,
  start,
  setStart,
  setPlayer
) => {
  //increases the drop time everytime the player clears 10 rows 
  if (rows > (level + 1) * 10) {
    setLevel((prev) => prev + 1);
    setDropTime(1000 / (level + 1) + 200);
  }
  //if we don't collide then move the tetromino/piece/shape by y - 1(drop by one)
  if (!checkCollision(player, stage, { x: 0, y: 1 })) {
    updatePlayerPos({ x: 0, y: 1, collided: false }, setPlayer);
  }
  else {
    //if the y axis is less than one, then it means the player lost.Their pieces reached the top
    if (player.pos.y < 1) {
      console.log("GAME OVER!");
      //alert the socket that this player lost.
      socketEmit(mainSocket, "died", mainSocket.id);
      //set the gameOver state variable to true.
      setGameOver(true);
      //reset the drop time
      setDropTime(null);
      //set the Start state variable to false
      setStart(false);
    }
    //if we collide set the player collided variable to true
    //to show that the piece collided(with either another tetromino or the stage)
    updatePlayerPos({ x: 0, y: 0, collided: true }, setPlayer);
  }
};

//self explainatory, player rotate function that s called everytime the player wishes to
//rotate their tetromino/pice
export const playerRotation = (
  stage,
  dir,
  playerRotateFunc,
  checkCollision,
  rotate,
  player,
  setPlayer
) => {
  playerRotateFunc(stage, dir, checkCollision, rotate, player, setPlayer);
};

//also self explainatory, movePlayer function that is called everytime the user
//wishes to move their pieces left or right.
export const movePlayer = (dir, updatePlayerPos, player, stage, setPlayer) => {
  //check if we dont collide if we move left/right. if we dont collide
  //enter the loop and move the piece.
  //otherwise do nothing.
  if (!checkCollision(player, stage, { x: dir, y: 0 })) {
    updatePlayerPos({ x: dir, y: 0 }, setPlayer);
  }
};
