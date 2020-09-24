class Piece {
	constructor() {
		this.TETROMINOS = {
			0: { shape: [[0]], color: "0, 0, 0" },
			B: { shape: [["B"]], color: "255, 255, 255" },
			J: {
				shape: [
					[0, "J", 0],
					[0, "J", 0],
					["J", "J", 0],
				],
				color: "102, 255, 51",
			},
			L: {
				shape: [
					[0, "L", 0],
					[0, "L", 0],
					[0, "L", "L"],
				],
				color: "0, 255, 255",
			},
			I: {
				shape: [
					[0, "I", 0, 0],
					[0, "I", 0, 0],
					[0, "I", 0, 0],
					[0, "I", 0, 0],
				],
				color: "255, 255, 0",
			},
			O: {
				shape: [
					["O", "O"],
					["O", "O"],
				],
				color: "255, 51, 0",
			},
			S: {
				shape: [
					[0, "S", "S"],
					["S", "S", 0],
					[0, 0, 0],
				],
				color: "255, 51, 204",
			},
			Z: {
				shape: [
					["Z", "Z", 0],
					[0, "Z", "Z"],
					[0, 0, 0],
				],
				color: "227, 78, 78",
			},
			T: {
				shape: [
					[0, 0, 0],
					["T", "T", "T"],
					[0, "T", 0],
				],
				color: "255, 166, 77",
			},
		};
	}

	randomTetromino() {
		const tetrominos = "IJLOSTZ";
		const randTetromino =
			tetrominos[Math.floor(Math.random() * tetrominos.length)];
		return this.TETROMINOS[randTetromino];
	}
}

module.exports.Piece = Piece;
