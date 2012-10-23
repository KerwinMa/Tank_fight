var libpath = "./";
require(libpath + "Game.js");
require(libpath + "Player.js");
require(libpath + "Tank.js");
function TankServer() {
	/*=========
	  Variables
	  =========*/

	//private	
	//network
	var port;						// Game port
	var count;						// Keeps track how many people are connected to server
	var pause;
	
	//game
	var startTime;					// game start time in miliseconds
	var nextPID;					// PID to assign to next connected player (i.e. which player slot is open)
	var gameInterval = undefined;	// Interval variable used for gameLoop
	var players;					// Associative array for players, indexed via sid
									// To get a Player object, do "players[sid]"
									// Can extend to more players if needed
									
	/*===================
	  getPlayer [Private]
	  ===================*/
	var getPlayer = function(pid) {
		// Returns the player in the players object, based on given PID
		for (p in players) {
			if (players[p].pid === pid)
				return players[p];
		}
	}

	/*===================
	  resetGame [Private]
	  ===================*/
	var resetGame = function() {
		// Clears gameInterval and set it to undefined
		clearInterval(gameInterval);
		gameInterval = undefined;

		var p1 = getPlayer(1);
		var p2 = getPlayer(2);

		//game win or lose 
		// if (ball.y < Pong.HEIGHT/2) { //if ball in upper boundary
		// 	io.sockets.socket(p1.sid).emit('endGame', {msg: "Player 1 Loses."});
		// 	io.sockets.socket(p2.sid).emit('endGame', {msg: "Player 1 Loses."});
		// }
		// else {
		// 	io.sockets.socket(p1.sid).emit('endGame', {msg: "Player 2 Loses."});
		// 	io.sockets.socket(p2.sid).emit('endGame', {msg: "Player 2 Loses."});
		// }
	}

	/*===================
	  gameLoop [Private]
	  ===================*/
	var gameLoop = function() {
		// Check if ball is moving
		if (ball.isMoving()) {
			// Grab players
			var p1 = getPlayer(1);
			var p2 = getPlayer(2);

		} else {
			// Reset
			console.log("resetGame");
			resetGame();
		}
	}

	/*==================
	  start [Privileged]
	  ==================*/
	this.start = function() {
		try {
			// Initialization
			port = Game.PORT;
			
			// change log level to 3 for debugging messages
			io = require('socket.io').listen(port, {
					'log level':2 
			});

			count = 0;
			nextPID = 1;
			gameInterval = undefined;
			players = new Object;
			console.log("current time is : " + Date.now());
			/*----------------------
			  Socket Event Listeners
			  ----------------------*/
			// Upon connection established from a client socket
			io.sockets.on('connection', function (socket) {
				count++;

				// Sends to client
				socket.emit('serverMsg', {msg: "There is now " + count + " players."});

				if (count > 4) {
					// Send back message that game is full
					socket.emit('serverMsg', {msg: "Sorry, game full. Come back another time!"});

					// Force a disconnect
					socket.disconnect();
					count--;
				} else {
					// Sends to everyone connected to server except the client
					socket.broadcast.emit('serverMsg', {msg: "There is now " + count + " players."});
					
					var startPosX = 500/nextPID;
					var startPosY = 0;
					var startPosZ = -500/nextPID;
					

					// Send message to new player (the current client)
					socket.emit('serverMsg', {msg: "You are Player " + nextPID});				

					// Create player object and insert into players with key = socket.id
					players[socket.id] = new Player(socket.id, nextPID, startPosX. startPosY, startPosZ);

					// Updates the nextPID to issue (flip-flop between 1 and 2)
					nextPID = ((nextPID + 1) % 2 === 0) ? 2 : 1;
				}

				// When the client closes the connection to the server/closes the window
				socket.on('disconnect',
					function(e) {
						// Stop game if it's playing
						if (gameInterval != undefined) {
							resetGame();
						}

						// Decrease count
						count--;

						// Set nextPID to quitting player's PID
						nextPID = players[socket.id].pid;

						// Remove player who wants to quit/closed the window
						delete players[socket.id];

						// Sends to everyone connected to server except the client
						socket.broadcast.emit('serverMsg', {msg: "There is now " + count + " players."});
					});

				// Upon receiving a message tagged with "start", along with an obj "data" (the "data" sent is {}. Refer to PongClient.js)
				socket.on('start',
					function(data) {
						if (gameInterval !== undefined) {
							console.log("Already playing!");
						} else if (Object.keys(players).length < 2) {
							console.log("Not enough players!");
							socket.emit('serverMsg', {msg: "Not enough players!"});
						} else {						
							console.log("Let the games begin!");
							startTime = Date.now();
							gameInterval = setInterval(function() {gameLoop();}, 1000/Game.FRAME_RATE);
						}
					});

				// Upon receiving a message tagged with "move", along with an obj "data"
				// socket.on('move',
				// 	function(data) {
				// 		//do something to move
				// 		//players[socket.id].getDelay());
				// 	});

				// Upon receiving a message tagged with "delay", along with an obj "data"
				socket.on('delay',
					function(data) {
						players[socket.id].setDelay(data.delay);
						pause = data.pause;
					});
			});
		} catch (e) {
			console.log("Cannot listen to " + port + "\n" + e);
		}
	}
}

// "public static void main(String[] args)"
// This will auto run after this script is loaded
var gameServer = new TankServer();
gameServer.start();

// vim:ts=4
