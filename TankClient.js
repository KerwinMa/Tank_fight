TankClient.js// Load libraries
var lib_path = "./";
console.log("loading files...");
loadScript(lib_path, "Tank.js");
loadScript("", "http://" + Game.SERVER_NAME + ":" + Game.PORT +"/socket.io/socket.io.js");
//"http://" + Game.SERVER_NAME + ":" + Game.PORT + 
function TankClient(){
	var isLost = false;
	//NETWORK
	var socket;			// socket used to connect to server
	var delay;			// delay simulated on current client
	var pause = false;
	var clock = new THREE.Clock();
	var cID = 1;
	
	//THREEJS
	var container, stats;
	var camera, scene, renderer, objects, controls,projector;
	var particleLight, pointLight;
	var dae, skin, obj, dae2, skin2, obj2;
	var loader = new THREE.ColladaLoader();
	var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x333333});
	var sphereGeo = new THREE.SphereGeometry(5, 30, 30);
	
	//TANKS
	var sMyTank, sOppTank, cMyTank; //Tank objects in game 
	var tankCloseDistance = 50;
	
	//for loading tank
	var objects=[];
	var vel=7,velX=1, velZ=1;
	
	//AI1
	var aispeed=10;
	
	//MAP
	var myMap = new Map();
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight,
		ASPECT = WIDTH / HEIGHT;
	var t = 0;
	
	//BULLETS
	var bullets = [];
	
	
	//GAME
	var tanks = [];
	var gameStarted = false;
	var gameStartTime = 0, serverStartTime = 0;
	var disconnected = false;
	
	var endGameL = false;
	var endGameW = false;
	var restart = false;
	
	var threshX=threshZ=100;
	
	//TO SERVER
	var lastPosX=-500,lastPosZ=-500,lastRotY=0;

	var sphereMaterial = new THREE.MeshBasicMaterial({
		color: 0x333333
	});
	var sphereGeo = new THREE.SphereGeometry(5, 30, 30);
	if(document.readyState==="complete")
	{
		div=document.createElement('div');
		div.innerHTML="Click to start";
		div.id="intro";
		div.style.width="100%";
		div.style.height="100%";
		document.getElementById("mybody").appendChild(div);		
	}

	loader.options.convertUpAxis = true;
	loader.load('./simple_tank1.dae', function(collada) {
		obj = new THREE.Object3D();
		dae = collada.scene;
		dae2 = new THREE.Object3D();
		dae.clone(dae2);
		dae.scale.x = dae.scale.y = dae.scale.z = 30;

		dae.position.y = 0;
		dae.position.x = 0;
		dae.position.z = 0;
		dae.rotation.y = 0;
		dae.startX = dae.startZ = -500;
		dae.updateMatrix();
		dae.id = 1;
		obj.add(dae);
		obj.position.x = -500;
		obj.position.z = -500;
		obj.position.y = 0;

		objects.push(obj);
		obj2 = new THREE.Object3D();
		dae2.scale.x = dae2.scale.y = dae2.scale.z = 30;
		dae2.position.x = dae2.startX = 0;
		dae2.position.y = 0;
		dae2.position.z = dae2.startZ = 0;
		dae2.rotation.y = 0;
		dae2.updateMatrix();
		dae2.id = 2;
		obj2.add(dae2);
		obj2.position.set(500, 0, 500);
		objects.push(obj2);
		
		init();
		rendInterval = setInterval(function() {
			render();
		}, 1000 / 60); //Request animation frame is 60fps
	});

	var spinTank = function (angle,id) {
		new TWEEN.Tween({
			y : objects[id-1].children[0].rotation.y
		})
		.to({
			y : angle
		}, 50)
		.onUpdate(function () {
			objects[id-1].children[0].rotation.y = this.y;
		})
		.start();
	}	
	
	var moveTank = function (pos,id) {
		new TWEEN.Tween({
			x : objects[id-1].position.x,
			z : objects[id-1].position.z
		})
		.to({
			x : pos.x,
			z : pos.z
		}, 100)
		.onUpdate(function () {
			objects[id-1].position.x = this.x;
			objects[id-1].position.z = this.z;
		})
		.start();
	}

	/*=====================
	initNetwork [Private]
	=====================*/

	var initNetwork = function() {
		// Attempts to connect to game server
		try {
			socket = io.connect("http://" + Game.SERVER_NAME + ":" + Game.PORT);

			// Upon receiving a message tagged with "serverMsg", along with an obj "data"
			socket.on("serverMsg", function(data) {
				console.log("serverMsg " + data.msg);
			});

			// // Getting player info upon connection to server
			socket.on("playerDetails", function(data) {
				cID = data.playerNo;

				if(data.playerNo === 1) {
					sMyTank = new Tank(data.xValue1, data.zValue1);
					sMyTank.cID = 1;
					sOppTank = new Tank(data.xValue2, data.zValue2);
					sOppTank.cID = 2;
					cMyTank = new Tank(data.xValue1, data.zValue1);
					tanks.push(sMyTank);
					tanks.push(sOppTank);
				} else {
					sMyTank = new Tank(data.xValue2, data.zValue2);
					sMyTank.cID = 2;
					sOppTank = new Tank(data.xValue1, data.zValue1);
					sOppTank.cID = 1;
					cMyTank = new Tank(data.xValue2, data.zValue2);
					tanks.push(sMyTank);
					tanks.push(sOppTank);
					controls = new THREE.FirstPersonControls(objects, 2);
					controls.movementSpeed = 0;
					controls.lookSpeed = 0;
					controls.lookVertical = false;
					controls.noFly = true;
					controls.activeLook = false;
				}

				setInterval(function() {
					updateServer();
				}, 50);
			});

			// Upon receiving a message tagged with "update", along with an obj "data"
			socket.on("update", function(data) {
				if(cID === 1) {
					if(!(objects[1].prevX == data.oppX && objects[1].prevZ == data.oppZ)) {
						moveTank(new THREE.Vector3(data.oppX, 0, data.oppZ), 2);
						objects[1].prevX = data.oppX;
						objects[1].prevZ = data.oppZ;
					}
					console.log(data);
					tanks[0].health = data.myHealth;
					tanks[1].health = data.oppHealth;
					var direction = 1; //clockwise
					var closest = closestAngle(data.oppRot);
					console.log("closest" + closest*180/Math.PI);
					console.log("my old rotation = "+objects[1].prevOppRot*180/Math.PI);
					console.log("my current rotation = "+ objects[1].children[0].rotation.y*180/Math.PI + " obj rotation =" + objects[1].rotation.y*180/Math.PI);
					console.log("my new rotation = "+data.oppRot*180/Math.PI);
					var threshAngle = 5 * Math.PI / 180;

					if(data.oppRot - objects[1].prevOppRot > 0) 
						direction = 2; //anticlocwise
					else if(data.oppRot - objects[1].prevOppRot == 0) 
						direction = 0; //same direction 			
					
					objects[1].prevOppRot = data.oppRot;
					
					if(direction != 0) {
						if(Math.abs(closest - data.oppRot) <= threshAngle) {
							spinTank(closest + Math.PI / 2, 2);
							setAutoSpeed(closest, 1);
						} else if(getRegion(data.oppRot) == 1) {
							if(direction == 1) {
								if(data.oppRot > 0) {
									spinTank(Math.PI / 2, 2);
									setAutoSpeed(0, 1);
								} else {
									spinTank(-3 * Math.PI / 2, 2);
									setAutoSpeed(0, 1);
								}
							} else if(direction == 2) {
								if(data.oppRot > 0) {
									spinTank(Math.PI, 2);
									setAutoSpeed(Math.PI / 2, 1);
								} else {
									spinTank(-Math.PI, 2);
									setAutoSpeed(-1.5 * Math.PI, 1);
								}
							}
						} else if(getRegion(data.oppRot) == 2) {
							if(direction == 1) {
								if(data.oppRot > 0) {
									spinTank(Math.PI, 2);
									setAutoSpeed(Math.PI / 2, 1);
								} else {
									spinTank(-Math.PI, 2);
									setAutoSpeed(-1.5 * Math.PI, 1);
								}
							} else if(direction == 2) {
								if(data.oppRot > 0) {
									spinTank(1.5 * Math.PI, 2);
									setAutoSpeed(Math.PI, 1);
								} else {
									spinTank(-Math.PI / 2, 2);
									setAutoSpeed(-Math.PI, 1);
								}
							}
						} else if(getRegion(data.oppRot) == 3) {
							if(direction == 1) {
								if(data.oppRot > 0) {
									spinTank(Math.PI + Math.PI / 2, 2);
									setAutoSpeed(Math.PI, 1);
								} else {
									spinTank(-Math.PI + Math.PI / 2, 2);
									setAutoSpeed(-Math.PI, 1);
								}
							} else if(direction == 2) {
								if(data.oppRot > 0) {
									spinTank(0, 2);
									setAutoSpeed(1.5 * Math.PI, 1);
								} else {
									spinTank(0, 2);
									setAutoSpeed(-0.5 * Math.PI, 1);
								}
							}
						} else if(getRegion(data.oppRot) == 4) {
							if(direction == 1) {
								if(data.oppRot > 0) {
									spinTank(0, 2);
									setAutoSpeed(1.5 * Math.PI, 1);
								} else {
									spinTank(0, 2);
									setAutoSpeed(-0.5 * Math.PI, 1);
								}
							} else if(direction == 2) {
								if(data.oppRot > 0) {
									spinTank(Math.PI / 2, 2);
									setAutoSpeed(0, 1);
								} else {
									spinTank(-3 * Math.PI / 2, 2);
									setAutoSpeed(0, 1);
								}
							}
						}
					}
					//  console.log("prevx = "+objects[1].prevX+" prevz = "+objects[1].prevZ);
					// console.log("direction =  "+direction);			
					//obj2.position.x = data.oppX;
					//obj2.position.z = data.oppZ;
					//dae2.rotation.y = data.oppRot + Math.PI / 2;
					//dae2.rotation.y = data.oppRot;
				} else {
					tanks[1].health = data.myHealth;
					tanks[0].health = data.oppHealth;

					if(!(objects[0].prevX == data.oppX && objects[0].prevX == data.oppZ)) {
						moveTank(new THREE.Vector3(data.oppX, 0, data.oppZ), 1);
						objects[0].prevX = data.oppX;
						objects[0].prevZ = data.oppZ;
					}

					var closest = closestAngle(data.oppRot);
					// console.log("closest" + closest*180/Math.PI);
					// console.log("my old rotation = "+objects[0].prevOppRot*180/Math.PI);
					// console.log("my current rotation = "+ objects[0].children[0].rotation.y*180/Math.PI + " obj rotation =" + objects[0].rotation.y*180/Math.PI);
					// console.log("my new rotation = "+data.oppRot*180/Math.PI);
					var threshAngle = 5 * Math.PI / 180;

					var direction = 1; //clockwise
					if(data.oppRot - objects[0].prevOppRot > 0) 
						direction = 2; //anticlocwise
					if(data.oppRot - objects[0].prevOppRot == 0) 
						direction = 0; //same direction 			
					
					objects[0].prevOppRot = data.oppRot;

					if(direction != 0) {
						if(Math.abs(closest - data.oppRot) <= threshAngle) {
							spinTank(closest, 1);
							setAutoSpeed(closest, 0);
						} else if(getRegion(data.oppRot) == 1) {
							if(direction == 1) {
								if(data.oppRot > 0) {
									spinTank(0, 1);
									setAutoSpeed(0, 0);
								} else {
									spinTank(0, 1);
									setAutoSpeed(0, 0);
								}
							} else if(direction == 2) {
								if(data.oppRot > 0) {
									spinTank(Math.PI / 2, 1);
									setAutoSpeed(Math.PI / 2, 0);
								} else {
									spinTank(-1.5 * Math.PI, 1);
									setAutoSpeed(-1.5 * Math.PI, 0);
								}
							}
						} else if(getRegion(data.oppRot) == 2) {
							if(direction == 1) {
								if(data.oppRot > 0) {
									spinTank(Math.PI / 2, 1);
									setAutoSpeed(Math.PI / 2, 0);
								} else {
									spinTank(-1.5 * Math.PI, 1);
									setAutoSpeed(-1.5 * Math.PI, 0);
								}
							} else if(direction == 2) {
								if(data.oppRot > 0) {
									spinTank(Math.PI, 1);
									setAutoSpeed(Math.PI, 0);
								} else {
									spinTank(-Math.PI, 1);
									setAutoSpeed(-Math.PI, 0);
								}
							}
						} else if(getRegion(data.oppRot) == 3) {
							if(direction == 1) {
								if(data.oppRot > 0) {
									spinTank(Math.PI, 1);
									setAutoSpeed(Math.PI, 0);
								} else {
									spinTank(-Math.PI, 1);
									setAutoSpeed(-Math.PI, 0);
								}
							} else if(direction == 2) {
								if(data.oppRot > 0) {
									spinTank(1.5 * Math.PI, 1);
									setAutoSpeed(1.5 * Math.PI, 0);

								} else {
									spinTank(-0.5 * Math.PI, 1);
									setAutoSpeed(-0.5 * Math.PI, 0);
								}
							}
						} else if(getRegion(data.oppRot) == 4) {
							if(direction == 1) {
								if(data.oppRot > 0) {
									spinTank(1.5 * Math.PI, 1);
									setAutoSpeed(1.5 * Math.PI, 0);
								} else {
									spinTank(-0.5 * Math.PI, 1);
									setAutoSpeed(-0.5 * Math.PI, 0);
								}
							} else if(direction == 2) {
								if(data.oppRot > 0) {
									spinTank(0, 1);
									setAutoSpeed(0, 0);
								} else {
									spinTank(0, 1);
									setAutoSpeed(0, 0);
								}
							}
						}
					}
					// console.log("direction =  "+direction);	
					//   console.log("prevx = "+objects[0].prevX+" prevz = "+objects[0].prevZ);
					// console.log("vx = "+objects[0].vx+" vz = "+objects[0].vz);
					//obj.position.x = data.oppX;
					//obj.position.z = data.oppZ;
					//dae.rotation.y = data.oppRot;
				}
			});

			socket.on("startGame", function(data) {
				document.getElementById("intro").style.display="none";
				document.getElementById("intro").innerHTML='none';
				//document.getElementById("mybody").style.opacity=1.0;
				gameStarted = true;
				controls.movementSpeed = 5000;
				endGameL = false;
				endGameW = false;
				gameStartTime = Date.now();
				console.log("Game started!");
			});

			socket.on("createBullet", function(data) {
				createOppBullet(data);
			});

			socket.on("updateBullet", function(data){

			});

			socket.on("endGame", function(data) {
				console.log("Lost game");
				if(data.result == "won")
					endGameW = true;
				else
					endGameL = true;
				gameStarted = false;
			});
			
			socket.on("endGameW", function() {
				console.log("Won game");
				endGameW = true;
				gameStarted = false;
			});

			// Upon disconnecting from server
			socket.on("disconnect", function() {
				console.log("You have disconnected from game server.");
				disconnected = true;
			});
		} catch(e) {
			console.log("Failed to connect to " + "http://" + Game.SERVER_NAME + ":" + Game.PORT);
			console.log(e);
		}
	}


	function init() {
		container = document.createElement('div');
		document.body.appendChild(container);
		
		Game.HEIGHT = window.innerHeight;
		Game.WIDTH = window.innerWidth;

		camera = new THREE.OrthographicCamera(window.innerWidth / -1, window.innerWidth / 1, window.innerHeight / 1, window.innerHeight / -1, -1000, 1000);
		camera.position.x = 55; //60
		camera.position.y = 45; //45
		camera.position.z = 0;

		scene = new THREE.Scene();

		setupScene();
		projector = new THREE.Projector();

		document.addEventListener("click", function(e) {
			console.log("click");
			e.preventDefault;
			if(gameStarted) {
				console.log("playing");
				if(e.which === 1) { // Left click only
					createBullet(cID);
					socket.emit("createBullet", {
						playerID: cID
					});
					console.log("createBullet");
				}	
			} else {
				socket.emit("start", {});
			}
		}, false);

		// document.addEventListener("touchend", function(e) {
		// 	e.preventDefault;
		// 	if(gameStarted) {
		// 			createBullet(cID);
		// 			socket.emit("createBullet", {
		// 				playerID: cID
		// 			});
		// 	} else {
		// 		socket.emit("start", {});
		// 	}
		// }, false);

		document.addEventListener("keydown", function(e) {
			e.preventDefault;
			if(gameStarted && e.keyCode === 32) {
				createBullet(cID);
				playSound("fire.mp3");
				socket.emit("createBullet", {
					playerID: cID
				});
			} else {
				socket.emit("start", {});
			}
		}, false);

		scene.add(obj);
		scene.add(obj2);

		controls = new THREE.FirstPersonControls(objects, 1);
		controls.movementSpeed = 0;
		controls.lookSpeed = 0;
		controls.lookVertical = false;
		controls.noFly = true;
		controls.activeLook = false;

		scene.add(new THREE.AmbientLight(0xcccccc));

		var directionalLight = new THREE.DirectionalLight(0xeeeeee);
		directionalLight.position.x = -150;
		directionalLight.position.y = 150;
		directionalLight.position.z = -150;
		directionalLight.position.normalize();
		scene.add(directionalLight);

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild(stats.domElement);

		var div2=document.createElement('div');
		div2.innerHTML='<p>Health: <span id="health">100</span><br />Score: <span id="score">0</span></p>';
		div2.id="hud";
		container.appendChild(div2);	

		for(i=0;i<objects.length;i++) {			
			objects[i].vx=0;
			objects[i].vz=0;
			objects[i].prevOppRot=objects[i].children[0].rotation.y;
			objects[i].prevX=objects[i].position.x;
			objects[i].prevZ=objects[i].position.z;
		}
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
		document.getElementById("intro").style.width=window.innerWidth;
		document.getElementById("intro").style.height=window.innerHeight;
		
		document.getElementById("hurt").style.width=window.innerWidth;
		document.getElementById("hurt").style.height=window.innerHeight;
		/*$('#intro, #hurt').css({
			width: window.innerWidth,
			height: window.innerHeight
		});*/
	}

	function render() {
		if(endGameL) {
			renderer.domElement.style.opacity = 0;
			document.getElementById("intro").style.display = "block";
			//document.getElementById("intro").style.visibility="visible";
			document.getElementById("intro").innerHTML = 'You Lost :(! <div>Play Again?<\div>';
			resetGame();
		} else if(endGameW) {
			renderer.domElement.style.opacity = 0;
			document.getElementById("intro").style.display = "block";
			//document.getElementById("intro").style.visibility="visible";
			document.getElementById("intro").innerHTML = 'You Won:) <div>Play Again?<\div>';
			resetGame()
		}

		if(disconnected) {
			//$(renderer.domElement).fadeOut();
			//$('#intro').fadeIn();
			//$('#intro').html('You have been disconnected!');		
			renderer.domElement.style.opacity = 0;
			document.getElementById("intro").style.display = "block";
			document.getElementById("intro").innerHTML = 'You have been disconnected!';
		}

		if(gameStarted) {
			renderer.domElement.style.opacity = 1.0;
		} else {
			renderer.domElement.style.opacity = 0;
		}

		var timer = Date.now() * 0.0005;
		var delta = clock.getDelta();
		controls.update(0.001);
		 

		for(i=0;i<objects.length;i++) {
			if(i==cID-1)
			 	continue;
			if(myMap.checkWallCollision(objects[i].position)) {
				objects[i].vx=0;
				objects[i].vz=0;
			}
			for(j = 0; j < objects.length; j++) {
				if(i == j) 
					continue;
				else {
					var center = objects[i].position.clone();
					
					if(getDistance(objects[j].position, objects[i].position) < tankCloseDistance) {
						objects[i].vx=0;
						objects[i].vz=0;
					}
				}
			}

			if(cID==1) {
				objects[i].translateX(objects[i].vx);
				objects[i].translateZ(objects[i].vz);
			} else if(cID == 2) {
				objects[i].translateX(-objects[i].vz);
				objects[i].translateZ(objects[i].vx);
			}
		}
		// console.log("vx = "+objects[0].vx+" vz = "+objects[0].vz+"rot"+objects[0].children[0].rotation.y);

		camera.lookAt(scene.position);

		TWEEN.update();
			
		//Simple bullet moving
		for(var i = bullets.length - 1; i >= 0; i--) {
			var b = bullets[i];
			var aim = checkTankCollision(b);
			if(myMap.checkWallCollision(b.position) || aim != -1) {
				bullets.splice(i, 1);
				playSound("shot.mp3");
				scene.remove(b);
				console.log("predicted steps = " + b.stepX);
				console.log("endPoint = " + b.position.x + " " + b.position.z);
				// if(aim != -1) {
				// 	for(j = 0; j < tanks.length; j++) {
				// 		if(tanks[j].cID == aim + 1) {
				// 			tanks[j].health -= 10;
				// 			//console.log("aim is " + aim + " with health " + tanks[j].health);
				// 			if(tanks[j].health <= 0) {
				// 				isLost = true;
				// 				console.log("lost is = " + isLost);
				// 				socket.emit("lost",{tank:tanks[j].cID});
				// 			}								
				// 		}
				// 	}
				// }
				continue;
			} else {
				b.translateX(b.velX);
				b.translateZ(b.velZ);
				b.stepX = b.stepX + 1;
			}
		}

		// if(tanks[cID-1].health < 25) 
		// 	document.getElementById("health").style.color = "#DF0101";

		// document.getElementById("health").innerHTML = tanks[cID-1].health;

		renderer.render(scene, camera);
		stats.update();	
	}

	function createBullet(cID) {		
		//moveTank(new THREE.Vector3(100,0,100));
		//spinTank(Math.PI);
		var sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
		sphere.position.set(objects[cID - 1].position.x, objects[cID - 1].position.y + 25, objects[cID - 1].position.z);

		sphere.velX = -vel * Math.sin(objects[cID - 1].children[0].rotation.y % (2 * Math.PI));
		sphere.velZ = -vel * Math.cos(objects[cID - 1].children[0].rotation.y % (2 * Math.PI));
		sphere.cID = cID;
		sphere.stepX = 0;

		sMyTank.x = objects[cID - 1].position.x;
		sMyTank.z = objects[cID - 1].position.z;
		sMyTank.rotationY = objects[cID - 1].children[0].rotation.y % (2 * Math.PI);
		sMyTank.endPoint();
		console.log(sphere);
		//var corner = sMyTank.getCorners();
		//console.log("corner = " +sMyTank.getCorners());
		//console.log("roty = " + (sMyTank.rotationY % (2 * Math.PI))*180/Math.PI + " x = " + sMyTank.x + " z = " + sMyTank.z);
		setTimeout(function() {
			bullets.push(sphere);
		}, 50);
		scene.add(sphere);
	}

	function createOppBullet(data) {
		var player = data.playerID;
		var sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
		sphere.position.set(objects[player - 1].position.x, objects[player - 1].position.y + 25, objects[player - 1].position.z);
		var curGameTime = Date.now()-gameStartTime;
		var timeToMove = data.predTime - curGameTime;
		var angle;
		if(player === 1) {
			angle = objects[player - 1].children[0].rotation.y;
		} else {
			angle = objects[player - 1].children[0].rotation.y - Math.PI / 2;
		}
		sphere.velX = (data.endX - objects[player - 1].position.x)/(timeToMove/(1000/60));
		sphere.velZ = (data.endZ - objects[player - 1].position.z)/(timeToMove/(1000/60));
		sphere.cID = player;
		sphere.stepX = 0;
		bullets.push(sphere);
		scene.add(sphere);
	}

	function setupScene() {
		var units = myMap.mapW;
		// Geometry: floor
		var floor = new THREE.Mesh(
		new THREE.CubeGeometry(units * (myMap.UNITSIZE), 1, units * (myMap.UNITSIZE)), new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture('wall-2.jpg')
		}));
		scene.add(floor);

		// Geometry: walls
		var cube = new THREE.CubeGeometry(myMap.UNITSIZE, myMap.WALLHEIGHT, myMap.UNITSIZE);
		var materials = [
			new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture('wall-1.jpg')
			}), new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture('wall-1.jpg')
			}), ];

		for(var i = 0; i < myMap.mapW; i++) {
			for(var j = 0, m = myMap.map[i].length; j < m; j++) {
				if(myMap.map[i][j]) {
					var wall = new THREE.Mesh(cube, materials[myMap.map[i][j] - 1]);
					wall.position.x = (i - units / 2) * myMap.UNITSIZE + 100;
					wall.position.y = myMap.WALLHEIGHT / 2;
					wall.position.z = (j - units / 2) * myMap.UNITSIZE + 100;
					scene.add(wall);
				}
			}
		}
		var sphereGeo2 = new THREE.SphereGeometry(30, 30, 30);
		var sphere1 = new THREE.Mesh(sphereGeo2, sphereMaterial);
		sphere1.position.set(800,myMap.WALLHEIGHT, 800);
		scene.add(sphere1);
		var sphere2 = new THREE.Mesh(sphereGeo2, sphereMaterial);
		sphere2.position.set(-800,myMap.WALLHEIGHT, -800);
		scene.add(sphere2);
		var sphere3 = new THREE.Mesh(sphereGeo2, sphereMaterial);
		sphere3.position.set(800,myMap.WALLHEIGHT, -800);
		scene.add(sphere3);
		var sphere4 = new THREE.Mesh(sphereGeo2, sphereMaterial);
		sphere4.position.set(-800,myMap.WALLHEIGHT, 800);
		scene.add(sphere4);
	}

	function resetGame() {
		//stop movement of own tank
		controls.movementSpeed = 0;

		//reset position of tank
		obj.position.set(-500, 0,-500);
		obj2.position.set(500, 0, 500);

		for(i=0;i<objects.length;i++) {	
			//reset the rotation of tanks to zero	
			objects[i].children[0].rotation.y = 0;	

			//reset tweening parameters
			objects[i].vx=0;
			objects[i].vz=0;
			objects[i].prevOppRot=objects[i].children[0].rotation.y;
			objects[i].prevX=objects[i].position.x;
			objects[i].prevZ=objects[i].position.z;
			tanks[i].health = 100;
		}
	}

	/*==================
	start [Privileged]
	==================*/
	this.start = function() {
		// Initialize game objects
		//date = new Date();
		//delay = 0;
		//rendInterval = undefined;
		//simInterval = undefined;
		// Initialize network
		initNetwork();
	}

	
	function updateServer() {

		//if(cID===1)
		//	socket.emit("move", {newX: obj.position.x, newZ: obj.position.z, rotY: dae.rotation.y});
		//else
		//	socket.emit("move", {newX: obj2.position.x, newZ: obj2.position.z, rotY: dae2.rotation.y});

		if (cID === 1) {
			//if( (Math.abs(obj.position.x-lastPosX)>threshX||Math.abs(obj.position.z-lastPosZ)>threshZ)&&lastRotY!=dae.rotation.y)
			{
				//lastPosX=obj.position.x;lastPosZ=obj.position.z;lastRotY=dae.rotation.y
				//console.log("Updatin server");
				socket.emit("move", {
					newX : obj.position.x,
					newZ : obj.position.z,
					rotY : dae.rotation.y
				});
			}
		} else {
			//if((Math.abs(obj2.position.x-lastPosX)>threshX||(Math.abs(obj2.position.z-lastPosZ)>threshZ))&&lastRotY!=dae2.rotation.y)	
			{
				//lastPosX=obj2.position.x;lastPosZ=obj2.position.z;lastRotY=dae2.rotation.y
				//console.log("Updatin server");
				socket.emit("move", {
					newX : obj2.position.x,
					newZ : obj2.position.z,
					rotY : dae2.rotation.y
				});
			}
		}
	}

	function getDistance(pos1, pos2) {
		return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.z - pos2.z, 2));
	}

	function checkTankCollision(bullet) {
		for(i = 0; i < objects.length; i++) {
			if(i == bullet.cID - 1) continue;
			else {
				var center = objects[i].position.clone();				
				if(getDistance(bullet.position, center) < tankCloseDistance) 
					return i;
			}
		}
		return -1;
	}

	function getRegion(angle) {
		if (((angle > 0 && angle < Math.PI / 2) || (angle < 0 && angle > -2 * Math.PI && angle < -1.5 * Math.PI)) || angle == 0 || angle == -2 * Math.PI)
			return 1;
		else if (((angle > 0 && angle < Math.PI && angle > 0.5 * Math.PI) || (angle < 0 && angle < -Math.PI && angle > -1.5 * Math.PI)) || angle == Math.PI / 2 || angle == -1.5 * Math.PI)
			return 2;
		else if (((angle > 0 && angle > Math.PI && angle < 1.5 * Math.PI) || (angle < 0 && angle > -Math.PI && angle < -0.5 * Math.PI)) || angle == Math.PI || angle == -Math.PI)
			return 3;
		else
			return 4;		
	}

	function closestAngle(angle,direction) {
		var threshAngle=5*Math.PI/180;
		var closest=3/2*Math.PI;
		for(ang=(3/2)*Math.PI;ang>=-3/2*Math.PI;ang-=Math.PI/2) {
			if(Math.abs(angle-ang)<Math.abs(closest-angle))
				closest=ang;	
		}
		return closest;
	}

	function setAutoSpeed(angle,id) {
		if(angle == 0) {
			objects[id].vx = 0;
			objects[id].vz = -velZ;
		} else if(angle == Math.PI / 2 || angle == -1.5 * Math.PI) {
			objects[id].vx = -velX;
			objects[id].vz = 0;
		} else if(angle == Math.PI || angle == -Math.PI) {
			objects[id].vx = 0;
			objects[id].vz = velZ;
		} else if(angle == 1.5 * Math.PI || angle == -Math.PI / 2) {
			objects[id].vx = velX;
			objects[id].vz = 0;
		}
	}
		
	function playSound(soundfile) {
		 document.getElementById("dummy").innerHTML=
		 "<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
	}
}
// This will auto run after this script is loaded
// Run Client. Give leeway of 0.1 second for libraries to load
var client = new TankClient();
setTimeout(function() {
	client.start();
}, 1000);
