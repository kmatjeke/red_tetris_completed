const { randomTetromino } = require("../client/helpers/tetrominos");
const { Piece } = require("./models/Piece");

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
