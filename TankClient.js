// Load libraries
var lib_path = "./";
loadScript(lib_path, "Tank.js");
loadScript("", "http://" + Game.SERVER_NAME + ":" + Game.PORT + "/socket.io/socket.io.js");

function TankClient(){

	//network
	var socket;			// socket used to connect to server
	var delay;			// delay simulated on current client
	var pause = false;

	var container, stats;
	var camera, scene, renderer, objects, controls,projector;
	var particleLight, pointLight;
	var dae, skin, obj, dae2, skin2, obj2, mouse = { x: 0, y: 0 };
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;
	var vel=7,velX, velZ;
	var loader = new THREE.ColladaLoader();

	// Map part
	var map = [ // 1 2 3 4 5 6 7 8 9
	           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 0
	           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1,], // 1
	           [1, 0, 0, 0, 2, 0, 0, 0, 0, 1,], // 2
	           [1, 0, 0, 0, 0, 2, 0, 0, 0, 1,], // 3
	           [1, 0, 0, 2, 0, 0, 2, 0, 0, 1,], // 4
	           [1, 0, 0, 0, 2, 0, 0, 0, 0, 1,], // 5
	           [1, 0, 0, 0, 0, 1, 0, 0, 0, 1,], // 6
	           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1,], // 7
	           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1,], // 8
	           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 9
	           ], mapW = map.length, mapH = map[0].length;

	// Semi-constants
	var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight,
	ASPECT = WIDTH / HEIGHT,
	UNITSIZE = 200,
	WALLHEIGHT = UNITSIZE / 5;

	var t = 0;
	var clock = new THREE.Clock();

	loader.options.convertUpAxis = true;

	loader.load( './models/simple_tank1.dae', function ( collada ) {
		obj = new THREE.Object3D();
		console.log(collada.scene);
		dae = collada.scene;
		dae2 = new THREE.Object3D();
		dae.clone(dae2);

		dae.scale.x = dae.scale.y = dae.scale.z = 30;
		dae.position.x = -500;
		dae.position.y = 0;
		dae.position.z = -500;
		dae.rotation.y=0;
		dae.updateMatrix();
		dae.id=1;
		obj.add(dae);
		dae.rotation.y =  Math.PI/2;

		obj2 = new THREE.Object3D();
		dae2.scale.x = dae2.scale.y = dae2.scale.z = 30;
		dae2.position.x = 0;
		dae2.position.y = 0;	
		dae2.position.z = 0;
		dae2.rotation.y=0;
		dae2.updateMatrix();
		dae2.id=2;
		obj2.add(dae2);
		dae2.rotation.y =  Math.PI/2;	
		console.log(dae);
		console.log(dae2);

		init();
		animate();
	} );

	/*=====================
	  initNetwork [Private]
	  =====================*/
	var initNetwork = function() {
		// Attempts to connect to game server
		try {
			socket = io.connect("http://" + Pong.SERVER_NAME + ":" + Pong.PORT);

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
				//animate();
			});

			// // Getting player info upon connection to server
			// socket.on("playerDetails", function(data) {
			// get details about player and opponents
			// 	// Start gameCycle
			// 	animate();
			// });

			// Upon receiving a message tagged with "update", along with an obj "data"
			socket.on("update", function(data) {
				//updateStates(data);
			});

			socket.on("endGame", function(data) {
				//stoEnd = 1;
				//remove event handlers

				//appendLog("serverMsg", data.msg);
			});

			// Upon disconnecting from server
			socket.on("disconnect", function() {
				console.log("You have disconnected from game server.");

				// Display information on HTML page
				//appendLog("serverMsg", "You have disconnected from game server");
			});

		} catch (e) {
			console.log("Failed to connect to " + "http://" + Pong.SERVER_NAME + ":" + Pong.PORT);
			console.log("e");
			//appendLog("Failed to connect to " + "http://" + Pong.SERVER_NAME + ":" + Pong.PORT + ". Please refresh.");
		}
	}

	//initGame
	function init() {
		container = document.createElement('div');
		document.body.appendChild(container);
		
		camera = new THREE.OrthographicCamera( window.innerWidth/-1 , window.innerWidth/1, window.innerHeight/1, window.innerHeight/-1, -1000, 1000 );
		camera.position.x = 55; //60
		camera.position.y = 45; //45
		camera.position.z = 0;

		scene = new THREE.Scene();
		setupScene();
		if(THREEx.FullScreen.available()) {
			THREEx.FullScreen.request();
			console.log("FullScreen");
		}
		projector = new THREE.Projector();

		
		$(document).click(function(e) {
			e.preventDefault;
			if (e.which === 1) { // Left click only
				createBullet();
				}
		});

		scene.add(obj);
		scene.add(obj2);
		if(obj2.visible)
			console.log("dae visible");

		controls = new THREE.FirstPersonControls(obj);
		controls.movementSpeed = 3000;
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
	}


	function animate() {

		var delta = clock.getDelta();

		requestAnimationFrame( animate );

		if ( t > 1 ) t = 0;

		if ( skin ) {

			for ( var i = 0; i < skin.morphTargetInfluences.length; i++ ) {
				skin.morphTargetInfluences[ i ] = 0;
			}

			skin.morphTargetInfluences[ Math.floor( t * 30 ) ] = 1;

			t += delta;

		}

		render();
		stats.update();

	}

	function render() {

		var timer = Date.now() * 0.0005;
		var delta = clock.getDelta();
		controls.update(0.001);
		
		camera.lookAt(scene.position);

		//Simple bullet moving
		for(var i = bullets.length-1; i >= 0; i--)
		{
			var b=bullets[i];
			if (checkWallCollision(b.position)) 
			{
				bullets.splice(i, 1);
				scene.remove(b);
				continue;
			}
			else
			{
				b.translateX(b.velX);
				b.translateZ(b.velZ);
			}
		}

		renderer.render( scene, camera );

	}
	//Creating bullets
	var bullets = [];
	var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x333333});
	var sphereGeo = new THREE.SphereGeometry(5, 30, 30);

	function createBullet() {
		
		
		var sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
		sphere.position.set(obj.position.x+dae.position.x, obj.position.y+dae.position.y+25, obj.position.z-dae.position.z);
		
		var vector = new THREE.Vector3(mouse.x, 1, mouse.y);
		var dirVector = new THREE.Vector3();
		dirVector.sub(vector,sphere.position.clone());
		sphere.ray = new THREE.Ray(
					sphere.position.clone(),
					dirVector.normalize(),0,1000
			);
		//bullets direction
		var degree=Math.ceil((dae.rotation.y%(2*Math.PI))*(180/Math.PI));	
		sphere.velX=-vel*Math.sin(dae.rotation.y%(2*Math.PI));
		sphere.velZ=-vel*Math.cos(dae.rotation.y%(2*Math.PI));
		
		bullets.push(sphere);
		scene.add(sphere);
		return sphere;
	}

	function setupScene() {
		var units = mapW;
	 
		// Geometry: floor
		var floor = new THREE.Mesh(
				new THREE.CubeGeometry(units * UNITSIZE, 1, units * UNITSIZE),
				new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/wall-2.jpg')})
		);
		scene.add(floor);
	 	
		// Geometry: walls
		var cube = new THREE.CubeGeometry(UNITSIZE, WALLHEIGHT, UNITSIZE);
		var materials = [
		                 new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/wall-1.jpg')}),
		                 new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/wall-1.jpg')}),
		                 ];
		for (var i = 0; i < mapW; i++) {
			for (var j = 0, m = map[i].length; j < m; j++) {
				if (map[i][j]) {
					var wall = new THREE.Mesh(cube, materials[map[i][j]-1]);
					wall.position.x = (i - units/2) * UNITSIZE + 100;
					wall.position.y = WALLHEIGHT/2;
					wall.position.z = (j - units/2) * UNITSIZE + 100;
					scene.add(wall);
				}
			}
		}
	}

	function getMapSector(v) {
		var x = Math.floor((v.x + UNITSIZE / 2-100) / UNITSIZE + mapW/2);
		var z = Math.floor((v.z + UNITSIZE / 2-100) / UNITSIZE + mapW/2);
		return {x: x, z: z};
	}

	function checkWallCollision(v) {
		var c = getMapSector(v);
		return map[c.x][c.z] > 0;
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
		init();
		animate();
	}
}

// "public static void main(String[] args)"
// This will auto run after this script is loaded

// Run Client. Give leeway of 0.1 second for libraries to load
var client = new TankClient();
//setTimeout(function() {client.start();}, 1000);

// vim:ts=4