class Player {
	constructor(id, nickname, room) {
		this.id = id;
		this.room = room;
		this.nickname = nickname;
		this.board = null;	
	}
}

module.exports.Player = Player