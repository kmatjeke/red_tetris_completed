const { Game } = require("./models/Game");

exports.makeSocket = (io) => {
	//generate an array containing the shapes the users will get.
	const generateShapes = require("./pieceHelper");
	//will keep track of the users in the room
	let users = [];
	//import Player class
	const Player = require("./models/Player").Player;
	io.on("connection", function (socket) {
		let room = new Game().room;
		let nickname = null;
		socket.emit("connection");
		socket.on("action", (action) => {
			if (action.type === "server/ping") {
				socket.emit("action", { type: "pong" });
			}
		});
		socket.on("join", (r) => {
			//separating the room name and the player name
			let temp = r.split("[");
			room = temp[0][0] == "#" ? temp[0].substr(1) : temp[0];
			//if there is a name in the url assign it to the nickname variable
			//if there isn't one, give the player a default of "Player"
			nickname = temp[1] ? temp[1].substr(0, temp[1].length - 1) : "Player";
			//join the room
			socket.join(room);
			//create the new players data. which is his socketID, nickname, and which room he's joining
			let nPlayer = new Player(socket.id, nickname, room);
			//push the user to the users array
			users.push(nPlayer);
			//initialize nPlayer back to the default null
			nPlayer = null;
			//emit to updateUsers the users who arre in the room
			io.to(room).emit(
				"updateUsers",
				users.filter((e) => e.room == room)
			);
		});
		//check if the player doesn't already exist in the room
		socket.on("updatePlayer", (p) => {
			users = users.map((e) => {
				if (e.id === socket.id) e.board = [...p];
				return e;
			});
			io.to(room).emit(
				"updateUsers",
				users.filter((e) => e.room == room)
			);
		});


		//emit to the room, the number of rows it must add to other players
		socket.on("clearRow", () => {
			socket.to(room).emit("addRow");
		});

		//emit to the room which player has exited the room.
		socket.on("died", (id) => {
			socket.to(room).emit("userExit", id);
		});

		//emit to the room, that it must start to generate shapes/tetromino
		socket.on("receive shapes", (room) => {
			io.to(room).emit("receive shapes", generateShapes());
		});

		//emit to the room when the game starts
		socket.on("start?", (room) => {
			io.to(room).emit("Startgame", room);
		});

		//emit to the room, which player is the winner
		socket.on("winner", (winner) => {
			socket.nsp.to(room).emit("setWinner", winner.nickname);
		});
	
		//emit to every user when the game has ended in order to terminate their session
		socket.on("endgame", () => {
			io.of("/")
				.in(room)
				.clients(function (error, clients) {
					if (clients.length - 2 == 0)
						socket.to(Object.keys(socket.rooms)[0]).emit("endgame");
				});
		});

		//emit which user has disconnected from the game, then remove them from the users array
		socket.on("disconnect", () => {
			users.splice(
				users.findIndex((e) => e.id == socket.id && e.room == room),
				1
			);
			socket.to(room).emit("userExit", socket.id);
		});
	});
};
