export const STAGE_WIDTH = 10; // Setting the stage width
export const STAGE_HEIGHT = 20; //setting the stage height

//Creating the stage array using the width and height and filling it with 0's and a clear label.
export const createStage = () =>
	Array.from(Array(STAGE_HEIGHT), () =>
		new Array(STAGE_WIDTH).fill([0, 'clear'])
	);

//insures that the tetromino/shape is not moving off the stage, by checking if it's not colliding
//with anything(left, right, bottom, or with other tetromino) 
export const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
	for (let y = 0; y < player.tetromino.length; y += 1) {
		for (let x = 0; x < player.tetromino[y].length; x += 1) {
			// 1. check that we are on an actual tetromino cell
			if (player.tetromino[y][x] !== 0) {
				if (
					// 2. check that move is in the limits of the height (y)
					!stage[y + player.pos.y + moveY] ||
					// 3. check that move is in the limmits of the width (x)
					!stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
					// 4. check that cell moving to isnt clear
					stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !==
					'clear'
				) {
					return true;
				}

			}
		}
	}
};
