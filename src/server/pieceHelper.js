const { randomTetromino } = require("../client/helpers/tetrominos");
const { Piece } = require("./models/Piece");

//creates and returns an array with 50 different shapes, we do this because it's
//easier to keep track of the shapes, and we can giv the users the same sequence of shapes
const generateShapes = () => {
	let shapes = [];
	Piece;
	let i = 0;
	while (i < 50) {
		shapes.push(new Piece().randomTetromino());
		i++;
	}
	return shapes;
};
module.exports = generateShapes;
