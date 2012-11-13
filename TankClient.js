// Load libraries
var lib_path = "./";
console.log("loading files...");
loadScript(lib_path, "Tank.js");
loadScript("", "http://" + Game.SERVER_NAME + ":" + Game.PORT + "/socket.io/socket.io.js");

function TankClient(){
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
	
	//TANKS
	var sMyTank, sOppTank, cMyTank; //Tank objects in game 

	//for loading tank
	var objects=[];
	var vel=7,velX, velZ;
	
	//AI
	var aispeed=10;
	
	//MAP
	var myMap = new Map();
	var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight,
	ASPECT = WIDTH / HEIGHT;
	var t = 0;
	
	//BULLETS
	var bullets = [];
	var tanks = [];
	var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x333333});
	var sphereGeo = new THREE.SphereGeometry(5, 30, 30);

	var gameStarted = false;
	var gameStartTime = 0;

	var disconnected = false;

	$(document).ready(function() 
	{
		$('body').append('<div id="intro">Click to start</div>');
		$('#intro').css({width: WIDTH, height: HEIGHT});
	});

	loader.options.convertUpAxis = true;
	loader.load( './models/simple_tank1.dae', function ( collada ) {
		obj = new THREE.Object3D();
		dae = collada.scene;
		dae2 = new THREE.Object3D();
		dae.clone(dae2);
		dae.scale.x = dae.scale.y = dae.scale.z = 30;
		dae.position.x = dae.startX = -500;
		dae.position.y = 0;
		dae.position.z = dae.startZ = -500;
		dae.rotation.y=0;
		dae.updateMatrix();
		dae.id=1;
		obj.add(dae);
		//dae.rotation.y =  Math.PI/2;
		objects.push(obj);
		obj2 = new THREE.Object3D();
		dae2.scale.x = dae2.scale.y = dae2.scale.z = 30;
		dae2.position.x = dae2.startX = 0;
		dae2.position.y = 0;	
		dae2.position.z = dae2.startZ= 0;
		dae2.rotation.y=0;
		dae2.updateMatrix();
		dae2.id=2;
		obj2.add(dae2);
		//dae2.rotation.y =  Math.PI/2;	
		console.log(dae);
		console.log(dae2);
		objects.push(obj2);
		//cloaded = true;
		init();
		setInterval(function() {
				render();
			}, 1000/60); //Request animation frame is 60fps
	} );

	/*=====================
	  initNetwork [Private]
	  =====================*/
	var initNetwork = function() {
		// Attempts to connect to game server
		try {
			socket = io.connect("http://" + Game.SERVER_NAME + ":" + Game.PORT);
			//pinging and stuff like that.
			// var curTime = Date.now();
			// socket.emit("ping", {x: curTime});)
			// socket.on("ping", function(data) {
			// 	curTime = date.now();
			// 	RTT = curTime - data.oldTime;
			// 	console.log("RTT = " + RTT);
			// });

			// Upon receiving a message tagged with "serverMsg", along with an obj "data"
			socket.on("serverMsg", function(data) {
				console.log("serverMsg " + data.msg);
			});

			// // Getting player info upon connection to server
			socket.on("playerDetails", function(data) {
				cID = data.playerNo;
				if(data.playerNo === 1) 
				{
					sMyTank = new Tank(data.xValue1, data.zValue1);
					sMyTank.cID=1;
					sOppTank = new Tank(data.xValue2, data.zValue2);
					sOppTank.cID=2;
					cMyTank = new Tank(data.xValue1, data.zValue1);
					tanks.push(sMyTank);
					tanks.push(sOppTank);
				} else  {
					sMyTank = new Tank(data.xValue2, data.zValue2);
					sMyTank.cID=2;
					sOppTank = new Tank(data.xValue1, data.zValue1);
					sOppTank.cID=1;
					cMyTank = new Tank(data.xValue2, data.zValue2);
					tanks.push(sMyTank);
					tanks.push(sOppTank);		
				}

				if(data.playerNo === 2) {
					controls = new THREE.FirstPersonControls(objects,2);
					controls.movementSpeed = 0;
					controls.lookSpeed = 0;
					controls.lookVertical = false; 
					controls.noFly = true;
					controls.activeLook = false;
				}

				//console.log("obj rot" + obj2.rotation.y);
				//console.log("dae rot" + dae2.rotation.y);
				setInterval(function() {
					updateServer();
				}, 50);
				});

			// Upon receiving a message tagged with "update", along with an obj "data"
			socket.on("update", function(data) {
				if(cID===1) {
					obj2.position.x = data.oppX;
					obj2.position.z = data.oppZ;
					dae2.rotation.y = data.oppRot + Math.PI/2;
					//dae2.rotation.y = data.oppRot;
				}
				else {
					obj.position.x = data.oppX;
					obj.position.z = data.oppZ;
					dae.rotation.y = data.oppRot;
				}				
			}
			);

			socket.on("startGame", function(data) {
				gameStarted = true;
				controls.movementSpeed = 5000;
				gameStartTime = data.sTime;
				console.log("Game started!");
				$('#intro').fadeOut();
			});

			socket.on("bullet", function(data){
				// console.log("before concat: ");
				// console.log(bullets);
				// console.log(data.bullets);
				//console.log("creating bullet for player " + data.playerID);
				//socket.emit("bullet",{playerID: data.playerID});
				createOppBullet(data.playerID);
				// bullets=bullets.concat(data.bullets);
				// console.log("after concat: ");
				// console.log(bullets);
			});

			socket.on("endGame", function(data) {

			});

			// Upon disconnecting from server
			socket.on("disconnect", function() {
				console.log("You have disconnected from game server.");
				disconnected = true;
			});

		
			
		} 
		catch (e)
		 {
			console.log("Failed to connect to " + "http://" + Game.SERVER_NAME + ":" + Game.PORT);
			console.log(e);
		}
	}

	//initGame
	function init() {
		container = document.createElement('div');
		document.body.appendChild(container);
		
		camera = new THREE.OrthographicCamera(window.innerWidth/-1 , window.innerWidth/1, window.innerHeight/1, window.innerHeight/-1, -1000, 1000 );
		camera.position.x = 55; //60
		camera.position.y = 45; //45
		camera.position.z = 0;

		scene = new THREE.Scene();

		setupScene();
		projector = new THREE.Projector();

		document.addEventListener("click", function(e) {
			e.preventDefault;
			if(gameStarted) {
				if (e.which === 1) { // Left click only
					createBullet(cID);
					socket.emit("bullet",{playerID: cID});
					console.log("click");					
				}
			} else {
				socket.emit("start", {});
			}			
		}, false);

		document.addEventListener("keydown", function(e) {
			e.preventDefault;
			//console.log(e.keyCode);
			if(gameStarted && e.keyCode === 32) {
				createBullet(cID);
				socket.emit("bullet",{playerID: cID});
				console.log("keydown");
			}		
		}, false);

		scene.add(obj);
		scene.add(obj2);
		
		
		controls = new THREE.FirstPersonControls(objects,1 );
		controls.movementSpeed = 0;
		controls.lookSpeed = 0;
		controls.lookVertical = false; 
		controls.noFly = true;
		controls.activeLook = false;

		// Lights
		scene.add( new THREE.AmbientLight(0xcccccc) );

		var directionalLight = new THREE.DirectionalLight(0xeeeeee );
		directionalLight.position.x = -150;
		directionalLight.position.y = 150;
		directionalLight.position.z = -150;
		directionalLight.position.normalize();
		scene.add( directionalLight );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );

		window.addEventListener( 'resize', onWindowResize, false );
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
		$('#intro, #hurt').css({width: window.innerWidth, height: window.innerHeight});
	}

	function render() {
		if(disconnected) {
			$(renderer.domElement).fadeOut();
			$('#intro').fadeIn();
			$('#intro').html('You have been disconnected!');
			return;
		}
		var timer = Date.now() * 0.0005;
		var delta = clock.getDelta();
		controls.update(0.001);
		camera.lookAt(scene.position);

		//Simple bullet moving
		for(var i = bullets.length-1; i >= 0; i--)
		{			
			var b=bullets[i];
			var aim=controls.checkTankCollision(b.position);
			//console.log(tanks[0]);//+" "+tanks[1].health);
			//console.log("aim is  "+aim);//+" with health"+ tanks[aim].health);
			if (myMap.checkWallCollision(b.position)||aim!=-1) 
			{
			
				bullets.splice(i, 1);
				scene.remove(b);
				if(aim!=-1)
				{
					for(j=0;j<tanks.length;j++)
						if(tanks[j].cID==aim+1)
						{
							tanks[j].health-=10;
							console.log("aim is  "+aim+" with health"+ tanks[j].health);
						}
				}
				continue;
			}	
			else
			{
				b.translateX(b.velX);
				b.translateZ(b.velZ);
			}
			
		}
		renderer.render(scene, camera);
		stats.update();		
	}
	


	function createBullet(cID) {
		var sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
		sphere.position.set( objects[cID-1].position.x+objects[cID-1].children[0].position.x,
							 objects[cID-1].position.y+objects[cID-1].children[0].position.y+25,
							 objects[cID-1].position.z-objects[cID-1].children[0].position.z);
				
		sphere.velX=-vel*Math.sin(objects[cID-1].children[0].rotation.y%(2*Math.PI));
		sphere.velZ=-vel*Math.cos(objects[cID-1].children[0].rotation.y%(2*Math.PI));
		
		bullets.push(sphere);
		// setTimeout(function() {
		// 	bullets.push(sphere);
		// }, 50);
		scene.add(sphere);
		return sphere;
	}
	function createOppBullet(player) {
		var sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
		sphere.position.set( objects[player-1].position.x+objects[player-1].children[0].position.x,
							 objects[player-1].position.y+objects[player-1].children[0].position.y+25,
							 objects[player-1].position.z-objects[player-1].children[0].position.z);
		var angle;
		if(player === 1) {
			angle=objects[player-1].children[0].rotation.y;	
		}
		else {
			angle=objects[player-1].children[0].rotation.y-Math.PI/2;	
		}
		
		sphere.velX=-vel*Math.sin(angle%(2*Math.PI));
		sphere.velZ=-vel*Math.cos(angle%(2*Math.PI));
		
		bullets.push(sphere);
		// setTimeout(function() {
		// 	bullets.push(sphere);
		// }, 50);
		scene.add(sphere);
		return sphere;
	}

	function setupScene() {
		var units = myMap.mapW;

		// Geometry: floor
		var floor = new THREE.Mesh(
			new THREE.CubeGeometry(units * (myMap.UNITSIZE), 1, units * (myMap.UNITSIZE)),
			new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('wall-2.jpg')})
		);
		scene.add(floor);
	 	
		// Geometry: walls
		var cube = new THREE.CubeGeometry(myMap.UNITSIZE, myMap.WALLHEIGHT, myMap.UNITSIZE);
		var materials = [
             new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('wall-1.jpg')}),
             new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('wall-1.jpg')}),
        ];

		for (var i = 0; i < myMap.mapW; i++) {
			for (var j = 0, m = myMap.map[i].length; j < m; j++) {
				if (myMap.map[i][j]) {
					var wall = new THREE.Mesh(cube, materials[myMap.map[i][j]-1]);
					wall.position.x = (i - units/2) * myMap.UNITSIZE + 100;
					wall.position.y = myMap.WALLHEIGHT/2;
					wall.position.z = (j - units/2) * myMap.UNITSIZE + 100;
					scene.add(wall);
				}
			}
		}
	}

	/*==================
	  start [Privileged]
	  ==================*/
	this.start = function() {
		// Initialize game objects
		//date = new Date();

		//delay = 0;

		// rendInterval = undefined;
		// simInterval = undefined;
		// Initialize network and GUI
		initNetwork();
	}

	function updateServer()
	 {
		if(cID===1)
		
			socket.emit("move", {newX: obj.position.x, newZ: obj.position.z, rotY: dae.rotation.y});
		else
			socket.emit("move", {newX: obj2.position.x, newZ: obj2.position.z, rotY: dae2.rotation.y});
	}
}

// This will auto run after this script is loaded
// Run Client. Give leeway of 0.1 second for libraries to load
var client = new TankClient();
setTimeout(function() {client.start();}, 1000);
