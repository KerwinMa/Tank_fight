// Load libraries
var lib_path = "./";
console.log("loading files...");
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
	var clock = new THREE.Clock();
	var cID;
	var sMyTank, sOppTank, cMyTank; //Tank objects in game 
	var that = this;
	//for loading tank
	var dae, skin, obj, dae2, skin2, obj2;

	var vel=7,velX, velZ;
	this.loader = new THREE.ColladaLoader();
	var myMap = new Map();

	//AI for tanks
	var aispeed=10;
	
	// Semi-constants
	var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight,
	ASPECT = WIDTH / HEIGHT;
	var t = 0;

	//Bullets
	var bullets = [];
	var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x333333});
	var sphereGeo = new THREE.SphereGeometry(5, 30, 30);
	

	this.loader.options.convertUpAxis = true;

	this.loader.load( './models/simple_tank1.dae', function ( collada ) {
		// if(cloaded) {
		// 	return;
		// }
		obj = new THREE.Object3D();
		dae = collada.scene;
		dae2 = new THREE.Object3D();
		dae.clone(dae2);

		dae.scale.x = dae.scale.y = dae.scale.z = 30;
		dae.position.x = 0;
		dae.position.y = 0;
		dae.position.z = 0;
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
		that.init();
		that.animate();
		//cloaded = true;
	} );

	/*=====================
	  initNetwork [Private]
	  =====================*/
	var initNetwork = function() {
		// Attempts to connect to game server
		try {
			socket = io.connect("http://" + Game.SERVER_NAME + ":" + Game.PORT);
			//network_init = true;
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
				if(data.playerNo === 1) {
					sMyTank = new Tank(data.xValue1, data.zValue1);
					sOppTank = new Tank(data.xValue2, data.zValue2);
					cMyTank = new Tank(data.xValue1, data.zValue1);
				} else {
					sMyTank = new Tank(data.xValue2, data.zValue2);
					sOppTank = new Tank(data.xValue1, data.zValue1);
					cMyTank = new Tank(data.xValue2, data.zValue2);
				}
				// Start gameCycle
				// var loader = new THREE.ColladaLoader();
				// loader.options.convertUpAxis = true;

				// loader.load( './models/simple_tank1.dae', function ( collada ) {
				// 	obj = new THREE.Object3D();
				// 	console.log(collada.scene);
				// 	dae = collada.scene;
				// 	dae2 = new THREE.Object3D();
				// 	dae.clone(dae2);

				// 	dae.scale.x = dae.scale.y = dae.scale.z = Tank.Scale;
				console.log(data);				
				dae.position.x = data.xValue1;
				dae.position.z = data.zValue1;
				dae.startX = data.xValue1;
				dae.startZ = data.zValue1;
				dae2.position.x = data.xValue2;
				dae2.position.z = data.zValue2;
				dae2.startX = data.xValue2;
				dae2.startZ = data.zValue2;
				console.log(obj);
				
				if(data.playerNo === 2) {
					controls = new THREE.FirstPersonControls(obj2);
					controls.movementSpeed = 5000;
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
				//updateStates(data);
			});

			socket.on("endGame", function(data) {

			});

			// Upon disconnecting from server
			socket.on("disconnect", function() {
				console.log("You have disconnected from game server.");
			});

		} catch (e) {
			console.log("Failed to connect to " + "http://" + Game.SERVER_NAME + ":" + Game.PORT);
			console.log(e);
			//appendLog("Failed to connect to " + "http://" + Pong.SERVER_NAME + ":" + Pong.PORT + ". Please refresh.");
		}
	}

	//initGame
	this.init = function() {
		container = document.createElement('div');
		document.body.appendChild(container);
		
		camera = new THREE.OrthographicCamera( window.innerWidth/-1 , window.innerWidth/1, window.innerHeight/1, window.innerHeight/-1, -1000, 1000 );
		camera.position.x = 55; //60
		camera.position.y = 45; //45
		camera.position.z = 0;

		scene = new THREE.Scene();

		setupScene();
		projector = new THREE.Projector();

		document.addEventListener("click", function(e) {
			e.preventDefault;
			if (e.which === 1) { // Left click only
				createBullet();
				}
			}, false);

		scene.add(obj);
		scene.add(obj2);

		controls = new THREE.FirstPersonControls(obj);
		controls.movementSpeed = 5000;
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


	this.animate = function() {

		var delta = clock.getDelta();

		requestAnimationFrame( that.animate );

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
			if (myMap.checkWallCollision(b.position)) 
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
	

	function createBullet() {
		
		var sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
		sphere.position.set(obj.position.x+dae.position.x, obj.position.y+dae.position.y+25, obj.position.z-dae.position.z);
		
		var degree=Math.ceil((dae.rotation.y%(2*Math.PI))*(180/Math.PI));	
		
		sphere.velX=-vel*Math.sin(dae.rotation.y%(2*Math.PI));
		sphere.velZ=-vel*Math.cos(dae.rotation.y%(2*Math.PI));
		
		if(cID==2)
		{
		sphere.position.set(obj2.position.x+dae2.position.x, obj2.position.y+dae2.position.y+25, obj2.position.z-dae2.position.z);
		var degree=Math.ceil((dae2.rotation.y%(2*Math.PI))*(180/Math.PI));	
		
		sphere.velX=-vel*Math.sin(dae2.rotation.y%(2*Math.PI));
		sphere.velZ=-vel*Math.cos(dae2.rotation.y%(2*Math.PI));

			
		}
		
		console.log("shooted at x= "+sphere.position.x+" z = "+sphere.position.z);
		console.log("mypos is  at x= "+obj.position.x+" z = "+obj.position.z);
		bullets.push(sphere);
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
		//if(network_init == false)
			initNetwork();
	}

	function updateServer() {
		socket.emit("move", {newX: obj.position.x, newZ: obj.position.z, rotY: obj.rotation.y});
		//console.log("move");
	}
}

// This will auto run after this script is loaded
// Run Client. Give leeway of 0.1 second for libraries to load
var client = new TankClient();
setTimeout(function() {client.start();}, 1000);
