import React from "react";
import { Typography } from "@material-ui/core";

import { StyledDisplay } from "./styles/StyledDisplay";

const Display = ({ gameOver, text, id }) => {
  return (
    <StyledDisplay id={id} gameOver={gameOver}>
      <Typography>{text}</Typography>
    </StyledDisplay>
  );
};

export default Display;
