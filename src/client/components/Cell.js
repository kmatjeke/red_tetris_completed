import React from 'react';
import { StyledCell } from './styles/StyledCell';

const Piece = require('../../server/models/Piece').Piece
let newPiece = new Piece()

const Cell = ({ type }) => (
	<StyledCell type={type} color={newPiece.TETROMINOS[type].color} />
);

export default React.memo(Cell);
