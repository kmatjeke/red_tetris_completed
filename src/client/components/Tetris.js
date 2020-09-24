import React, { useState, useEffect, useCallback } from "react";

import { createStage, checkCollision } from "../helpers/gameHelpers";
//import client socket managers
import { userSocket, socketOff, socketOn, socketEmit } from "../socket";

// Styled Component
import { StyledTetrisWrapper, StyledTetris } from "./styles/StyledTetris";

// Custom Hooks
import { useInterval } from "../hooks/useInterval";
import { usePlayer } from "../hooks/usePlayer";
import { useStage } from "../hooks/useStage";
import { useGameStatus } from "../hooks/useGameStatus";
import { movePlayer, dropPlayer, drop, playerRotation } from "../helpers/Playerfunctions";
// Components
import Stage from "./Stage";
import Display from "./Display";
import StartButton from "./StartButton";
import { TETROMINOS } from "../helpers/tetrominos";

//----------------------------------------------------------------------------------------------------//
//------------------------------------------Initializing the game-------------------------------------//
//----------------------------------------------------------------------------------------------------//

//initialize the game with default data
let newGame = {
	users: [],
	left: [],
	room: null,
};

let mainSocket = null;

//----------------------------------------------------------------------------------------------------//
//----------------------------------Creating the tetris component-------------------------------------//
//----------------------------------------------------------------------------------------------------//

//creating tetris component that will manage the whole game and it's features
const Tetris = (props) => {
	//---------------------------------------------------------------------------------------//
	//----------------------------------Creating game states---------------------------------//
	//---------------------------------------------------------------------------------------//

	//creating drop time state, which handles how fast the pieces drop. 
	const [dropTime, setDropTime] = useState(null);
	//self explanatory, creating a game over state which will handle ending the game
	const [gameOver, setGameOver] = useState(false);
	//self explanatory, creating a winner state which will handle setting the game winner
	const [winner, setWinner] = useState(null);
	//handles setting the first player who joins the room as the host
	const [host, setHost] = useState(false);
	//handles providing the user with random pieces/tetromino/shapes
	const [shapes, setShapes] = useState(null);
	//handles initializing new users who join the game
	const [user, setUser] = useState(null);
	//handles starting the game
	const [start, setStart] = useState(false);
	//tracks which shapes it gives the user, so that all player get the same shapes
	const [shapeTrack, setShapeTrack] = useState(0);

	//---------------------------------------------------------------------------------------//
	//---------------------------------Creating game objects---------------------------------//
	//---------------------------------------------------------------------------------------//

	//creating the player object which needs to the player state, wich uses the shape track state, and the tetromino/shape data 
	const {
		player,
		updatePlayerPos,
		resetPlayer,
		playerRotate,
		playerFall,
		setPlayer,
		rotate,
	} = usePlayer(setShapeTrack, TETROMINOS);
	//creating the stage object which takes in the stage state.
	const { stage, setStage, rowsCleared, addRow } = useStage(
		player,
		resetPlayer,
		mainSocket,
		shapes,
		shapeTrack,
		setPlayer
	);
	//creating objects which track the players score and level(to gradually increase the speed)
	const { score, setScore, rows, setRows, level, setLevel } = useGameStatus(
		rowsCleared
	);

	//initializing the states/resseting them when a new game starts.
	//using callback to avoid infinite loop.
	const startGame = useCallback(
		(
			setStart,
			setStage,
			setDropTime,
			resetPlayer,
			setGameOver,
			newGame,
			setWinner,
			setScore,
			setRows,
			setLevel
		) => {
			// Reset everything when new game starts/assigning default values
			setStart(true);
			setStage(createStage());
			setDropTime(1000);
			resetPlayer(shapes, shapeTrack, setPlayer);
			setGameOver(false);
			newGame.left = [...newGame.users];
			setWinner(null);
			setScore(0);
			setRows(0);
			setLevel(1);
		},
		// Adding dependencies used by the useCallback.
		[resetPlayer, setLevel, setRows, setScore, setStage, shapes]
	);

	useEffect(() => {
		if (shapes) {
			startGame(
				setStart,
				setStage,
				setDropTime,
				resetPlayer,
				setGameOver,
				newGame,
				setWinner,
				setScore,
				setRows,
				setLevel
			);
		}
		
	}, [shapes, startGame]);
	//if it's game over set shape track back to zero
	useEffect(() => {
		if (gameOver) setShapeTrack(0);
	}, [gameOver, shapeTrack, setShapeTrack]);

	//---------------------------------------------------------------------------------------//
	//------------------------------Creating socket.io functions-----------------------------//
	//---------------------------------------------------------------------------------------//

	//creating connecct variable which will handle everthing that deals with the sockets//
	const connect = useCallback(
		async (
			userSocket,
			newGame,
			setHost,
			setUser,
			setShapes,
			setWinner,
			setGameOver,
			setDropTime,
			setStart
		) => {
			//if theres no main socket
			if (!mainSocket) {
				//gets the room property and assigns it to the getRoom variable
				let test = props.room.split("[");
				//asigns the room data to newGame.room
				newGame.room = test[0][0] === "#" ? test[0].substr(1) : test[0];
				mainSocket = await userSocket(props.room);
				//turns off all sockets in that rooms(just in case those room sockets still exist)
				socketOff(mainSocket, "updateUsers")
				socketOff(mainSocket, "updateUsers");
				socketOff(mainSocket, "addRow");
				socketOff(mainSocket, "Startgame");
				socketOff(mainSocket, "userExit");
				socketOff(mainSocket, "setWinner");
				//turns on updateUsers socket.
				socketOn(mainSocket, "updateUsers", (t) => {
					newGame.users = t;
					//if this user created the room set him/her as host 
					if (newGame.users[0] && newGame.users[0].id === mainSocket.id)
						setHost(true);
					setUser(newGame.users.find((e) => e.id === mainSocket.id));
				});
				//turns on starting socket. which will emit receive shapes so all  room users
				//get the message to start the game.
				socketOn(mainSocket, "Startgame", (r) => {
					socketEmit(mainSocket, "updatePlayer", stage);
					if (newGame.users[0] && newGame.users[0].id === mainSocket.id)
						socketEmit(mainSocket, "receive shapes", r);
				});
				//turns on receive shapes socket, which listens for which shapes to receive
				//this is so that all users receive the exact same sequence of shapes
				socketOn(mainSocket, "receive shapes", (shapes1) => {
					setShapes(shapes1);
				});
				//turns on userExit socket, which listens for which user triggered a game over on their end
				//or which user left the room
				socketOn(mainSocket, "userExit", (id) => {
					//removes the user which left the room
					newGame.left.splice(
						newGame.left.findIndex((e) => e.id === id),
						1
					);
					//checks if there is more done 1 player remaining.
					//if not this user is the winner, socket emits winner
					if (newGame.left.length === 1) {
						setGameOver(true);
						setDropTime(null);
						socketEmit(mainSocket, "winner", newGame.left[0]);
					}
				});
				//turns on setWinner socket which listens and emits which player won
				socketOn(mainSocket, "setWinner", (nickname) => {
					setStart(false);
					socketEmit(mainSocket, "updatePlayer", stage);
					setWinner(nickname);
				});
			}
		},
		[props.room, stage]//adding useCallback dependencies
	);

	const useMountEffect = (
		fun,
		userSocket,
		newGame,
		setHost,
		setUser,
		setShapes,
		setWinner,
		setGameOver,
		setDropTime,
		setStart
	) =>
		useEffect(() => {
			fun(
				userSocket,
				newGame,
				setHost,
				setUser,
				setShapes,
				setWinner,
				setGameOver,
				setDropTime,
				setStart
			);
			
		}, []);

	//when host is starting new game emit the main socket,the message 'start', and the new game array
	//which holds the number of users and their names
	const callStartGame = (mainSocket, setStart, newGame) => {
		socketEmit(mainSocket,"start?", newGame.room);
		setStart(true);
	};


	//---------------------------------------------------------------------------------------//
	//-------------------------Creating player movement functions----------------------------//
	//---------------------------------------------------------------------------------------//

	//when users releases the down arrow restart the dropTime interval
	const keyUp = ({ keyCode }, gameOver, setDropTime, level) => {
		if (!gameOver) {
			if (keyCode === 40) {
				setDropTime(1000 / (level + 1) + 200);
			}
		}
	};

	//creating the player movement object, which has player input functions
	const move = (
		{ keyCode },
		movePlayer,
		dropPlayer,
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
		playerRotation,
		playerRotate,
		gameOver,
		setPlayer
	) => {
		if (!gameOver) {
			//calling playerFall funnction for pressing spacebar, which will
			//immediately drop the player shape to the bottom
			if (keyCode === 32) {
				playerFall(stage, player, checkCollision, setPlayer);
			}
			//calling movePlayer function for pressing left arrow, which will
			//move players shape to the left
			if (keyCode === 37) {
				movePlayer(-1, updatePlayerPos, player, stage, setPlayer);
			}
			//calling movePlayer function for pressing right arrow, which will
			//move players shape to the right
			else if (keyCode === 39) {
				movePlayer(1, updatePlayerPos, player, stage, setPlayer);
			}
			//calling dropPlayer function for pressing down arrow, which will
			//drop players shape by 1 immediately and turn off dropInterval
			else if (keyCode === 40) {
				dropPlayer(
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
				);
			}
			//calling PlayerRotaion function for pressing up arrow, which will
			//rotate the players shape
			else if (keyCode === 38) {
				playerRotation(
					stage,
					1,
					playerRotate,
					checkCollision,
					rotate,
					player,
					setPlayer
				);
			}
		}
	};

	//finally using the useInterval state, which handles how fast the pieces drop and
	//also drops the players shapes according to the current drop tome
	useInterval(
		(mainSocket, addRow, updatePlayerPos) => {
			socketOn( mainSocket,
				"addRow",
				() => {
					addRow(stage, setStage);
					updatePlayerPos({ x: 0, y: 0, collided: false }, setPlayer);
				},
				mainSocket,
				addRow,
				updatePlayerPos
			);
			//calls the drop function continuosly according to the current drop time
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
		},
		mainSocket,
		addRow,
		updatePlayerPos,
		dropTime
	);
	useMountEffect(
		connect,
		userSocket,
		newGame,
		setHost,
		setUser,
		setShapes,
		setWinner,
		setGameOver,
		setDropTime,
		setStart
	);


	//----------------------------------------------------------------------------------------------------//
	//----------------------------------------Return Tetris Component-------------------------------------//
	//-------------------Which is basically the whole combined tetris game components---------------------//
	//----------------------------------------------------------------------------------------------------//

	return (
		<StyledTetrisWrapper
			role="button"
			tabIndex="0"
			onKeyDown={(e) =>
				move(
					e,
					movePlayer,
					dropPlayer,
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
					playerRotation,
					playerRotate,
					gameOver,
					setPlayer
				)
			}
			onKeyUp={(e) => keyUp(e, gameOver, setDropTime, level)}
		>
			<StyledTetris>
				<Stage stage={stage} />
				<aside>
					{winner ? (
						<Display id="winnerDisplay" text={`Winner: ${winner}`} />
					) : (
						""
					)}
					{gameOver ? (
						<Display
							id="gameOverDisplay"
							gameOver={gameOver}
							text="Game Over"
						/>
					) : (
						<div id="test">
							{user ? (
								<Display id="nicknameDisplay" text={`Name: ${user.nickname}`} />
							) : (
								""
							)}
							<Display id="scoreDisplay" text={`Score: ${score}`} />
							<Display id="rowDisplay" text={`Rows: ${rows}`} />
							<Display id="levelDisplay" text={`Level: ${level}`} />
							<Display id="leftDisplay" text={`Left: ${newGame.left.length}`} />
						</div>
					)}
					{start ? (
						""
					) : host ? (
						<StartButton
							callback={callStartGame}
							mainSocket={mainSocket}
							setStart={setStart}
							newGame={newGame}
						/>
					) : (
						<p>Waiting for host</p>
					)}
				</aside>
				{!gameOver ? (
					<div id="stageContainer">
						{newGame.left
							? newGame.users.map((value, index) => {
									if (
										value.board &&
										value.id !== mainSocket.id &&
										newGame.left.find((e) => e.id === value.id)
									)
										return (
											<div key={index} style={{ padding: "0 10px" }}>
												<p>{value.nickname}</p>
												<Stage type={1} stage={value.board} />
											</div>
										);
									return null;
							  })
							: ""}
					</div>
				) : (
					""
				)}
			</StyledTetris>
		</StyledTetrisWrapper>
	);
};

export default Tetris;
