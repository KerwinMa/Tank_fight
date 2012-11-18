var libpath = "./";
require(libpath + "Game.js");
require(libpath + "Player.js");
require(libpath + "Tank.js");
require(libpath + "Map.js");
var bullets = [];
var myMap = new Map();
var vel =7;
var tankCloseDistance = 50;
function TankServer() {
	/*=========
	  Variables
	  =========*/
	//private	
	//network
	var port; // Game port
	var count; // Keeps track how many people are connected to server
	var pause;
	var prevTime = 0;
	
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

		if(p1.tank.health <= 0) {
			io.sockets.socket(p1.sid).emit('endGame', {result: "lost"});
			io.sockets.socket(p2.sid).emit('endGame', {result: "won"});
			console.log("Game Over. Player 2 Won");
		} else if(p2.tank.health <= 0) {
			io.sockets.socket(p1.sid).emit('endGame', {result: "won"});
			io.sockets.socket(p2.sid).emit('endGame', {result: "lost"});
			console.log("Game Over. Player 1 Won");
		}		
	}

	/*===================
	  gameLoop [Private]
	  ===================*/
	var gameLoop = function() {		
		for(var i = bullets.length - 1; i >= 0; i--) {
			var b = bullets[i];
			console.log("bullets " + b.x + b.z);
			var aim = checkTankCollision(b.x, b.z);
			var position = {
				x: 0,		
				z: 0
			};
			position.x = b.x;
			position.z = b.z;

			if(myMap.checkWallCollision(position) || aim != -1) {
				bullets.splice(i, 1);

				console.log("slicing" + aim);
				if(aim != -1) {
					var target = getPlayer(aim);
					target.tank.health -= 10;
					if(target.tank.health <= 10)
						resetGame();
					//console.log("Bullet hit player " + aim)
					// for(j = 0; j < players.length; j++) {
					// 	if(j == aim) {
					// 		console.log("Bullet hit player " + j)
					// 		player[j].tank.health -= 10;
					// 		if(player[j].tank.health <= 0) {
					// 			resetGame();
					// 		}
					// 	}
					// }
				}
				continue;
			} else {
				b.x += b.velX;
				b.z += b.velZ;
			}
		}
	}

	var updatePlayers = function() {
		if(gameInterval!= undefined) {
			var p1 = getPlayer(1);
			var p2 = getPlayer(2);

			var send1 = {
				myX: p1.tank.x,
				myZ: p1.tank.z,
				myRot: p1.tank.rotationY,
				myHealth: p1.tank.health,
				oppX: p2.tank.x,
				oppZ: p2.tank.z,
				oppRot: p2.tank.rotationY,
				oppHealth: p2.tank.health
			};

			var send2 = {
				myX: p2.tank.x,
				myZ: p2.tank.z,
				myRot: p2.tank.rotationY,
				myHealth:p2.tank.health,
				oppX: p1.tank.x,
				oppZ: p1.tank.z,
				oppRot: p1.tank.rotationY,
				oppHealth: p1.tank.health
			};

			io.sockets.socket(p1.sid).emit('update', send1);
			io.sockets.socket(p2.sid).emit('update', send2);
		}	
	}

	function checkTankCollision(bulletX, bulletZ) {
		console.log("check tank collision " + bulletX + " " + bulletZ);

		var p1 = getPlayer(1);
		var centerX = p1.tank.x;
		var centerZ = p1.tank.z;
		console.log("player1 " + " centerx " + centerX + " centreZ " + centerZ);
		if (getDistance(centerX, centerZ, bulletX, bulletZ) < tankCloseDistance)
			return 1;

		var p2 = getPlayer(2);
		centerX = p2.tank.x;
		centerZ = p2.tank.z;
		console.log("player2 " + " centerx " + centerX + " centreZ " + centerZ);
		if (getDistance(centerX, centerZ, bulletX, bulletZ) < tankCloseDistance)
			return 2;

		return -1;
	}

	function getDistance(x1, z1, x2, z2) {
		var dist = Math.sqrt(Math.pow(x1 - x2,2) + Math.pow(z1 - z2,2));
		console.log("distance between tank = " + dist);
		return dist;
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
				if(filePath == './') 
					filePath = './tank_fight.html';

				var extname = path.extname(filePath);
				var contentType = mimeTypes[extname];

				fs.exists(filePath, function(exists) {
					console.log("File Requested:" + filePath);
					if(exists) {
						fs.readFile(filePath, function(error, content) {
							if(error) {
								response.writeHead(500, {
									"Access-Control-Allow-Origin": "*"
								});							
								response.end();
							} else {
								response.writeHead(200, {
									"Content-Type": contentType,
									"Access-Control-Allow-Origin": "*"
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
				
				socket.on('lost',function(data) {
					var p1 = getPlayer(1);
					var p2 = getPlayer(2);
					if(data.tank === 1) 
					{
						console.log("Game Over. Player 1 Lost");
						io.sockets.socket(p1.sid).emit('endGameL', {});
						io.sockets.socket(p2.sid).emit('endGameW', {});
					}
					else if(data.tank === 2)
					{
						io.sockets.socket(p1.sid).emit('endGameW', {});
						io.sockets.socket(p2.sid).emit('endGameL', {});
						console.log("Game Over. Player 1 Won");
					}
					if(gameInterval != undefined) {
						resetGame();
					}
				});

				// Upon receiving a message tagged with "start", along with an obj "data" (the "data" sent is {}. Refer to PongClient.js)
				socket.on('start', function(data) {
					if(gameInterval !== undefined) {
						//console.log("Already playing!");
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
						}, 1000/Game.FRAME_RATE);

						setInterval(function(){
							updatePlayers();
						}, 200);
					}
				});

				// Upon receiving a message tagged with "move", along with an obj "data"
				socket.on('move', function(data) {
					players[socket.id].tank.move(data.newX, data.newZ, data.rotY);
				});

				socket.on('createBullet', function(data) {
					var p1 = getPlayer(1);
					var p2 = getPlayer(2);
					var curGameTime = Date.now() - startTime;

					if(socket.id === p1.sid) {
						var prediction = p1.tank.endPoint(curGameTime);

						var bullet = {
							x: 0,
							z: 0,
							velX: 0,
							velZ: 0
						};
						bullet.x = p1.tank.x;
						bullet.z = p1.tank.z;
						bullet.velX = -vel * Math.sin(p1.tank.rotationY % (2 * Math.PI));
						bullet.velZ = -vel * Math.cos(p1.tank.rotationY % (2 * Math.PI));
						bullets.push(bullet);
						console.log("creating bullet for player p1  at x" + bullet.x + " z = " + bullet.z);
						io.sockets.socket(p2.sid).emit("createBullet", {
							playerID: data.playerID,
							predTime: prediction.predTime,
							endX: prediction.endX,
							endZ: prediction.endZ
						});
					} else {
						var prediction = p2.tank.endPoint(curGameTime);

						var bullet = {
							x: 0,
							z: 0,
							velX: 0,
							velZ: 0
						};

						bullet.x = p2.tank.x;
						bullet.x = p2.tank.z;
						bullet.velX = -vel * Math.sin(p2.tank.rotationY % (2 * Math.PI));
						bullet.velZ = -vel * Math.cos(p2.tank.rotationY % (2 * Math.PI));
						bullets.push(bullet);
						console.log("creating bullet for player p1  at x" + bullet.x + " z = " + bullet.z);
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