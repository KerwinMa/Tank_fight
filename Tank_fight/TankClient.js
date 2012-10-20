var container, stats;

var camera, scene, renderer, objects, controls,projector;
var particleLight, pointLight;
var dae, skin, obj, mouse = { x: 0, y: 0 };
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
// Global vars
//var t = THREE, scene, cam, renderer, controls, clock, projector, model, skin;

// End of Map part

loader.options.convertUpAxis = true;
loader.load( './models/simple_tank1.dae', function ( collada ) {
	obj = new THREE.Object3D();
	dae = collada.scene;
	skin = collada.skins[1];
	dae.scale.x = dae.scale.y = dae.scale.z = 25;
	dae.position.x = -500;
	dae.position.y = 0;
	dae.position.z = -500;
	dae.rotation.y=0;
	dae.updateMatrix();
	obj.add(dae);
	//obj.rotation();
	dae.rotation.y =  Math.PI/2;
	//dae.rotation.z = Math.PI/2;
	// dae.rotation.y = - Math.PI/1;
	//dae.
	//obj.matrixAutoUpdate = true;
	
	init();
	animate();
} );

function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	
	camera = new THREE.OrthographicCamera( window.innerWidth/-1 , window.innerWidth/1, window.innerHeight/1, window.innerHeight/-1, -1000, 1000 );
	camera.position.x = 60;
	camera.position.y = 45;
	camera.position.z = 0;

	scene = new THREE.Scene();
	//scene = new t.Scene();
	setupScene();
	
	projector = new THREE.Projector();
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	//Event listener for shooting
	
	$(document).click(function(e) {
		e.preventDefault;
		if (e.which === 1) { // Left click only
			createBullet();
			}
	});

	
	
	
	// Grid

/*	var size = 500, step = 50;

	var geometry = new THREE.Geometry();

	for ( var i = - size; i <= size; i += step ) {

		geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
		geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

		geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
		geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

	}

	var line = new THREE.Line( geometry, material, THREE.LinePieces );
	scene.add( line );

	particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x008000 } ) );
	scene.add( particleLight );

	var geometry2 = new THREE.CubeGeometry( 50, 50, 50);
	var material = new THREE.MeshLambertMaterial( { color: 0xfff000, shading: THREE.FlatShading, overdraw: false	 } );

	for ( var i = 0; i < 10; i ++ ) {

		var cube = new THREE.Mesh( geometry2, material );

		cube.scale.y = Math.floor( Math.random() * 2 + 1 );

		cube.position.x = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;
		cube.position.y = ( cube.scale.y * 50 ) / 2;
		cube.position.z = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;

		scene.add( cube );
	}
*/
	scene.add(obj);

	controls = new THREE.FirstPersonControls(obj);
	controls.movementSpeed = 3000;
	controls.lookSpeed = 0;
	controls.lookVertical = false; // Temporary solution; play on flat surfaces only
	controls.noFly = true;
	controls.activeLook = false;

	// Lights

	scene.add( new THREE.AmbientLight( 0xcccccc ) );

	var directionalLight = new THREE.DirectionalLight(/*Math.random() * 0xffffff*/0xeeeeee );
	// directionalLight.position.x = Math.random() - 0.5;
	// directionalLight.position.y = Math.random() - 0.5;
	// directionalLight.position.z = Math.random() - 0.5;
	directionalLight.position.x = -150;
	directionalLight.position.y = 150;
	directionalLight.position.z = -150;
	directionalLight.position.normalize();
	scene.add( directionalLight );

	pointLight = new THREE.PointLight( 0xffffff, 4 );
	//pointLight.position = particleLight.position;
	//scene.add( pointLight );

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

var t = 0;
var clock = new THREE.Clock();

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
	//if(controls.moveLeft)	dae.rotation.y += -10*Math.PI/180;
	//if(controls.moveRight)	dae.rotation.y +=10*Math.PI/180;
				
	scene.add(obj);
	camera.lookAt( scene.position );

	//particleLight.position.x = Math.sin( timer * 4 ) * 3009;
	//particleLight.position.y = Math.cos( timer * 5 ) * 4000;
	//particleLight.position.z = Math.cos( timer * 4 ) * 3009;

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
function onDocumentMouseMove(e) {
	e.preventDefault();
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	
	}

function setupScene() {
	var units = mapW;
 
	// Geometry: floor
	var floor = new THREE.Mesh(
			new THREE.CubeGeometry(units * UNITSIZE, 1, units * UNITSIZE),
			new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/wall-2.jpg')})
	);
	floor.position.x =-100;
	floor.position.z = -100;
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
				wall.position.x = (i - units/2) * UNITSIZE;
				wall.position.y = WALLHEIGHT/2;
				wall.position.z = (j - units/2) * UNITSIZE;
				scene.add(wall);
			}
		}
	}
	

	/*/ Lighting
	var directionalLight1 = new THREE.DirectionalLight( 0xF7EFBE, 0.7 );
	directionalLight1.position.set( 0.5, 1, 0.5 );
	scene.add( directionalLight1 );
	var directionalLight2 = new THREE.DirectionalLight( 0xF7EFBE, 0.5 );
	directionalLight2.position.set( -0.5, -1, -0.5 );
	scene.add( directionalLight2 ); */
}


function getMapSector(v) {
	var x = Math.floor((v.x + UNITSIZE / 2) / UNITSIZE + mapW/2);
	var z = Math.floor((v.z + UNITSIZE / 2) / UNITSIZE + mapW/2);
	return {x: x, z: z};
}
function checkWallCollision(v) {
	var c = getMapSector(v);
	return map[c.x][c.z] > 0;
}

