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

// init();
// animate();


loader.options.convertUpAxis = true;
var loader2 = new THREE.ColladaLoader();
loader2.options.convertUpAxis = true;
// loader2.addEventListener('load', function ( collada ) {
// 	obj2 = new THREE.Object3D();
// 	dae2 = collada.scene;
// 	skin2 = collada.skins[1];
// 	dae2.scale.x = dae2.scale.y = dae2.scale.z = 25;
// 	dae2.position.x = 0;
// 	dae2.position.y = 0;
// 	dae2.position.z = 0;
// 	dae2.rotation.y=0;
// 	dae2.updateMatrix();
// 	dae2.id=1;
// 	obj2.add(dae2);
// 	dae2.rotation.y =  Math.PI/2;	
// } );

// function LoadModel(x, y, z){
// 	var loader = new THREE.ColladaLoader();
// 	var tank;
// 	loader.convertUpAxis = true;
// 	loader.load('./models/simple_tank1.dae', function colladaReady( collada ) {
// 		tank = collada.scene;
// 		//skin = collada.skins[1];
// 		tank.scale.x = tank.scale.y = tank.scale.z = 25;
// 		tank.position.x = x;
// 		tank.position.y = y;
// 		tank.position.z = z;
// 		tank.rotation.y=0;
// 		tank.updateMatrix();
// 		// dae.id=1;
// 		// obj.add(dae);
// 		// dae.rotation.y =  Math.PI/2;	
// 	} );
// 	return tank;
// }


loader.load( './models/simple_tank1.dae', function ( collada ) {
	obj = new THREE.Object3D();
	// obj2 = new THREE.Object3D();
	// dae2 = collada.scene;
	// skin2 = collada.skins[1];
	// dae2.scale.x = dae2.scale.y = dae2.scale.z = 25;
	// dae2.position.x = 0;
	// dae2.position.y = 0;
	// dae2.position.z = 0;
	// dae2.rotation.y=0;
	// dae2.updateMatrix();
	// obj2.add(dae);
	// dae2.rotation.y =  Math.PI/2;
	// dae2.id = 2;
	//clone 2nd object
	// dae = dae2.clone();
	// dae.id = 1;
	// dae.scale.x = dae.scale.y = dae.scale.z = 25;
	// dae.position.x = -500;
	// dae.position.y = 0;
	// dae.position.z = -500;
	// dae.rotation.y=0;
	// dae.updateMatrix();
	// obj.add(dae);
	// dae.rotation.y = Math.PI/2;
	// var geometry = collada.scene.children[2].geometry;
	// var material = collada.scene.children[2].material;
	console.log(collada.scene.children);
	// console.log(geometry);
	// console.log(material);
	dae = collada.scene;
	dae2 = new THREE.Object3D();
	for(var i = 0; i < collada.scene.children.length; i++)
	{
		if(collada.scene.children[i] instanceof THREE.Mesh) {
			//dae.add(new THREE.Mesh(collada.scene.children[i].geometry, collada.scene.children[i].material));
			dae2.add(new THREE.Mesh(collada.scene.children[i].geometry, collada.scene.children[i].material));
		} 
		// else 
		// {
		// 	dae.add(collada.scene.children[i]);
		// 	dae2.add(collada.scene.children[i]);
		// }
	}

	// for ( var i = 0; i < 10; i ++ ) {
	//     var mesh = new THREE.Mesh( geometry, material );
	//     mesh.position.set( i * 100, 0, 0 );
	//     scene.add( mesh );
	// }
	// dae = collada.scene;
	// skin = collada.skins[1];
	//dae = new THREE.Mesh(geometry, material);
	dae.scale.x = dae.scale.y = dae.scale.z = 25;
	dae.position.x = -500;
	dae.position.y = 0;
	dae.position.z = -500;
	dae.rotation.y=0;
	dae.updateMatrix();
	dae.id=1;
	obj.add(dae);
	dae.rotation.y =  Math.PI/2;

	//loader2.load('./models/simple_tank1.dae', function ( collada ) {
		obj2 = new THREE.Object3D();
		//dae.clone(dae2);
		//obj.clone(obj2);
		//dae2 = new THREE.Mesh(geometry, material);
		//skin2 = collada.skins[1];
		dae2.scale.x = dae2.scale.y = dae2.scale.z = 25;
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
	//} );

	init();
	animate();
} );


function init() {
	container = document.createElement('div');
	document.body.appendChild( container );
	
	camera = new THREE.OrthographicCamera( window.innerWidth/-1 , window.innerWidth/1, window.innerHeight/1, window.innerHeight/-1, -1000, 1000 );
	camera.position.x = 60;
	camera.position.y = 45;
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

	// dae = LoadModel(-500, 0, -500);
	// dae2 = LoadModel(0, 0, 0);
	// obj = new THREE.Object3D();
	// obj2 = new THREE.Object3D();
	// obj.add(dae);
	// obj2.add(dae2);
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

	var directionalLight = new THREE.DirectionalLight(/*Math.random() * 0xffffff*/0xeeeeee );
	directionalLight.position.x = -150;
	directionalLight.position.y = 150;
	directionalLight.position.z = -150;
	directionalLight.position.normalize();
	scene.add( directionalLight );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	//renderer.domElement.style.backgroundColor = '#D6F1FF';
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

		// guess this can be done smarter...

		// (Indeed, there are way more frames than needed and interpolation is not used at all
		//  could be something like - one morph per each skinning pose keyframe, or even less,
		//  animation could be resampled, morphing interpolation handles sparse keyframes quite well.
		//  Simple animation cycles like this look ok with 10-15 frames instead of 100 ;)

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
	scene.remove(obj);
	controls.update(0.001);
				
	scene.add(obj);
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