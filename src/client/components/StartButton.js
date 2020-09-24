import React from "react";
import { Button, Typography } from "@material-ui/core";

// import { StyledStartButton } from './styles/StyledStartButton';

const StartButton = ({ callback, mainSocket, setStart, newGame }) => (
  <Button
    variant="contained"
    id="startButton"
    onClick={() => callback(mainSocket, setStart, newGame, setStart)}
    fullWidth
  >
    {/* <StyledStartButton id="startButton" onClick={callback}> */}
    <Typography>START GAME</Typography>
  </Button>
);

export default StartButton;
