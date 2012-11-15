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
	var port; // Game port
	var count; // Keeps track how many people are connected to server
	var pause;

	//game
	var startTime; // game start time in miliseconds
	var nextPID; // PID to assign to next connected player (i.e. which player slot is open)
	var gameInterval = undefined; // Interval variable used for gameLoop
	var players; // Associative array for players, indexed via sid
	// To get a Player object, do "players[sid]"
	// Can extend to more players if needed			
	/*===================
	  getPlayer [Private]
	  ===================*/
	var getPlayer = function(pid) {
			// Returns the player in the players object, based on given PID
			for(p in players) {
				if(players[p].pid === pid) return players[p];
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
		//if (ball.isMoving()) {
		// Grab players
		var p1 = getPlayer(1);
		var p2 = getPlayer(2);

		var send1 = {
			myX: p1.tank.x,
			myZ: p1.tank.z,
			myRot: p1.tank.rotationY,
			oppX: p2.tank.x,
			oppZ: p2.tank.z,
			oppRot: p2.tank.rotationY,
		};
		var send2 = {
			myX: p2.tank.x,
			myZ: p2.tank.z,
			myRot: p2.tank.rotationY,
			oppX: p1.tank.x,
			oppZ: p1.tank.z,
			oppRot: p1.tank.rotationY,
		};
		io.sockets.socket(p1.sid).emit('update', send1);
		io.sockets.socket(p2.sid).emit('update', send2);
		// } else {
		// 	// Reset
		// 	console.log("resetGame");
		// 	resetGame();
		// }
	}

	/*==================
	 start [Privileged]
	==================*/
	this.start = function() {
		try {
			// Initialization
			port = Game.PORT;
			var http = require('http');
			var fs = require('fs');
			var path = require('path');
			var connect = require('connect');
			// change log level to 3 for debugging messages
			//.listen(port, { 'log level':3  );
			var mimeTypes = {
				".html": "text/html",
				".jpeg": "image/jpeg",
				".jpg": "image/jpeg",
				".png": "image/png",
				".js": "text/javascript",
				".css": "text/css"
			};

			var app = connect().use(connect.favicon()).use(connect.static(__dirname)).use(connect.logger()).use(connect.logger('dev')).use(function(request, response) {
				var filePath = '.' + request.url;
				if(filePath == './') filePath = './tank_fight.html';

				var extname = path.extname(filePath);
				var contentType = mimeTypes[extname];

				fs.exists(filePath, function(exists) {
					console.log("File Requested:" + filePath);
					if(exists) {
						fs.readFile(filePath, function(error, content) {
							if(error) {
								response.writeHead(500);
								response.end();
							} else {
								response.writeHead(200, {
									"Content-Type": contentType
								});
								response.end(content);
							}
						});
					} else {
						response.writeHead(404);
						response.end();
					}
				});
			});

			var server = http.createServer(app).listen(Game.PORT);

			io = require('socket.io').listen(server, {
				'log level': 2
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
			io.sockets.on('connection', function(socket) {
				count++;

				// Sends to client
				socket.emit('serverMsg', {
					msg: "There is now " + count + " players."
				});

				if(count > 2) {
					// Send back message that game is full
					socket.emit('serverMsg', {
						msg: "Sorry, game full. Come back another time!"
					});

					// Force a disconnect
					socket.disconnect();
					count--;
				} else {
					// Sends to everyone connected to server except the client
					socket.broadcast.emit('serverMsg', {
						msg: "There is now " + count + " players."
					});

					var startPosX1 = -500;
					var startPosZ1 = -500;
					var startPosX2 = 0;
					var startPosZ2 = 0;

					// Send message to new player (the current client)
					socket.emit('serverMsg', {
						msg: "You are Player " + nextPID
					});

					socket.emit('playerDetails', {
						playerNo: nextPID,
						xValue1: startPosX1,
						zValue1: startPosZ1,
						xValue2: startPosX2,
						zValue2: startPosZ2
					});

					// Create player object and insert into players with key = socket.id
					if(nextPID === 1) {
						players[socket.id] = new Player(socket.id, nextPID, startPosX1, startPosZ1);
					} else {
						players[socket.id] = new Player(socket.id, nextPID, startPosX2, startPosZ2);
					}
					// Updates the nextPID to issue (flip-flop between 1 and 2)
					//nextPID = (nextPID + 1 === 5) ? 1 : nextPID + 1;
					nextPID = ((nextPID + 1) % 2 === 0) ? 2 : 1;
				}

				// When the client closes the connection to the server/closes the window
				socket.on('disconnect', function(e) {
					// Stop game if it's playing
					if(gameInterval != undefined) {
						resetGame();
					}
					// Decrease count
					count--;
					// Set nextPID to quitting player's PID
					nextPID = players[socket.id].pid;
					// Remove player who wants to quit/closed the window
					delete players[socket.id];
					// Sends to everyone connected to server except the client
					socket.broadcast.emit('serverMsg', {
						msg: "There is now " + count + " players."
					});
				});

				// Upon receiving a message tagged with "start", along with an obj "data" (the "data" sent is {}. Refer to PongClient.js)
				socket.on('start', function(data) {
					if(gameInterval !== undefined) {
						console.log("Already playing!");
					} else if(Object.keys(players).length < 2) {
						console.log("Not enough players!");
						socket.emit('serverMsg', {
							msg: "Not enough players!"
						});
					} else {
						console.log("Let the games begin!");
						startTime = Date.now();
						io.sockets.emit('startGame', {
							sTime: startTime
						});
						gameInterval = setInterval(function() {
							gameLoop();
						}, 100);
					}
				});

				// Upon receiving a message tagged with "move", along with an obj "data"
				socket.on('move', function(data) {
					//console.log(data);
					players[socket.id].tank.move(data.newX, data.newZ, data.rotY);
				});

				socket.on('createBullet', function(data) {
					//console.log("createBullet");
					var p1 = getPlayer(1);
					var p2 = getPlayer(2);
					var curGameTime = Date.now() - startTime;
					if(socket.id === p1.sid) {						
						var prediction = p1.tank.endPoint(curGameTime);
						io.sockets.socket(p2.sid).emit("createBullet", {
							playerID: data.playerID,
							predTime: prediction.predTime,
							endX: prediction.endX,
							endZ: prediction.endZ
						});
					} else {
						var prediction = p2.tank.endPoint(curGameTime);
						io.sockets.socket(p1.sid).emit("createBullet", {
							playerID: data.playerID,
							predTime: prediction.predTime,
							endX: prediction.endX,
							endZ: prediction.endZ
						});
					}
				});

				// Upon receiving a message tagged with "delay", along with an obj "data"
				socket.on('delay', function(data) {
					players[socket.id].setDelay(data.delay);
					pause = data.pause;
				});
			});
		} catch(e) {
			console.log("Cannot listen to " + port + "\n" + e);
		}
	}
}

// "public static void main(String[] args)"
// This will auto run after this script is loaded
var gameServer = new TankServer();
gameServer.start();

// vim:ts=4