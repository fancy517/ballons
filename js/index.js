var scene, camera, renderer;
var geometry, texture, material, mesh, cake1, cakeModel, material_Cake1, mesh_Cake1;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var spheres = [];
var ballColors = [0x00bfff, 0xff00ff, 0x7cfc00, 0xdc143c, 0x7fff00, 0x00bfff, 0x00ffff,0xff0000];
var dx, dy, dz;
var clock = new THREE.Clock();
var time = 0;
var cakeWithFlame = new THREE.Group;
var allFlameMaterials = [];
var flames = [];
var balloonCount = 100;
var cakeRotSpeed = 0.0030;
var balloonSpeed = 0.0001;

// Do NOT modify following variables
var r = 11;
var initialAngle = 2;


function init(){
  //Configure renderer settings-------------------------------------------------
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.autoClear = true;
  renderer.setClearColor(0x000000, 0.0);
  document.body.appendChild(renderer.domElement);
  //----------------------------------------------------------------------------

  // Create an empty scene
  scene = new THREE.Scene();

  // Create a basic perspective camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 5000 );
  scene.add(camera);

  camera.position.z = 30;
  camera.position.y = 8;
  camera.lookAt(new THREE.Vector3(0,-20,0));

  //Create the lights
  var ambientLight = new THREE.AmbientLight(0xFFFFFF, .5);
  scene.add(ambientLight);

  var lights = [];
  lights[0] = new THREE.DirectionalLight( 0xffffff, 0.5);
  lights[0].position.set(1, 0, 0);
  lights[1] = new THREE.DirectionalLight( 0x11E8BB, 0.5);
  lights[1].position.set(0.75, 1, 0.5);
  lights[2] = new THREE.DirectionalLight( 0x8200C9, 0.5);
  lights[2].position.set(-0.75, -1, 0.5);
  scene.add(lights[0]);
  scene.add(lights[1]);
  scene.add(lights[2]);

  // Skybox
  var path = "textures/cube/Park2/";
  var format = '.jpg';
  var urls = [
    path + 'posx' + format, path + 'negx' + format,
    path + 'posy' + format, path + 'negy' + format,
    path + 'posz' + format, path + 'negz' + format
  ];
  var textureCube = new THREE.CubeTextureLoader().load( urls );
  textureCube.format = THREE.RGBFormat;
  scene.background = textureCube;

  // Add spheres (balloon)
  addBalloons();

  // Event handle
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  // Free Orbit control
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

}



//Keep everything appearing properly on screen when window resizes
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); //maintain aspect ratio
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove( event ) {
  mouseX = ( event.clientX - windowHalfX ) / 5;
  mouseY = ( event.clientY - windowHalfY ) / 5;
}


// Add Random Balloons
function addBalloons() {
  var geometry = new THREE.SphereBufferGeometry( 100, 32, 16 );
  var lineGeo = new THREE.Geometry();

  // Balloon tail
  lineGeo.vertices.push(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 2, 0),

    new THREE.Vector3(1, 2, 0),
    new THREE.Vector3(2, 4, 1),

    new THREE.Vector3(2, 4, 1),
    new THREE.Vector3(0, 6, 2),

    new THREE.Vector3(0, 6, 2),
    new THREE.Vector3(0, 8, 4),

    new THREE.Vector3(0, 8, 4),
    new THREE.Vector3(2, 10, 4)
  )
  var lineMat = new THREE.LineBasicMaterial({
    color: 0xaaaaaa,
    linewidth: 5,
    transparent: true,
    opacity: 0.6
  })

  for ( var i = 0; i < balloonCount; i ++ ) {

    var sphereGroup = new THREE.Group;
    var material = new THREE.MeshPhongMaterial( { 
      color: ballColors[i % ballColors.length],
      transparent: true,
      opacity: 0.4,
      shininess: 50,
      specular: 0x777777
    } );
    var mesh = new THREE.Mesh( geometry, material );

    var line = new THREE.LineSegments( lineGeo, lineMat );

    mesh.position.x = Math.random() * 20 - 10;
    mesh.position.y = Math.random() * 20 - 10;
    mesh.position.z = Math.random() * 1000 - 500;

    if(Math.abs(mesh.position.z) < 40) 
      mesh.position.z = 40 + Math.abs(mesh.position.z);

    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * .1 + .3;
    mesh.scale.y *= 1.2;

    line.position.x = mesh.position.x;
    line.position.y = mesh.position.y - 100 * mesh.scale.y - 10;
    line.position.z = mesh.position.z;
    line.scale.x = line.scale.y = line.scale.z = mesh.scale.y;

    sphereGroup.add(mesh);
    sphereGroup.add(line);

    scene.add(sphereGroup);

    spheres.push( sphereGroup );
  }

}

// Add Cake Object
function geoletters() {
  cakeModel = new THREE.Object3D();

  scene.add(cakeWithFlame);
  new THREE.MTLLoader()
    .setPath('models/')
    .load('Birthday_Cake.mtl', function(materials){
      materials.preload();
      new THREE.OBJLoader()
        .setMaterials(materials)
        .setPath('models/')
        .load('Birthday_Cake.obj', function ( object ) {
          cakeModel.add( object );
          cakeModel.rotation.x = -Math.PI / 2;
          cakeModel.position.y = -20
          cakeModel.position.z = -0.5;
          cakeModel.position.x = -0.2;

          cakeWithFlame.add(cakeModel);

          placeFlames();
        });
    })
}

// Generate flame
function flame(isFrontSide, x, z){
  let caseMesh = new THREE.Mesh();
  let flameGeo = new THREE.SphereBufferGeometry(0.5, 32, 32);
  let flameMaterials = [];
  flameGeo.translate(0, 0.5, 0);
  let flameMat = getFlameMaterial(isFrontSide);
  flameMaterials.push(flameMat);
  let flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.set(x, 2.6, z);
  flame.rotation.y = THREE.Math.degToRad(-45);

  flames.push(flame);
  allFlameMaterials.push(flameMaterials);

  caseMesh.add(flame);

  cakeWithFlame.add(caseMesh);
}

// Add Flames per each candle
function placeFlames() {
  for(var i = 0; i < 16; i ++) {
    a = THREE.Math.degToRad(360 / 16 * i + initialAngle) + cakeModel.rotation.z;
    x = r * Math.cos(a);
    z = r * Math.sin(a);
    flame(true, x, z);
  }
}


//Render Loop
var render = function () {
  requestAnimationFrame( render );

  cakeWithFlame.rotation.y -= cakeRotSpeed;


  // flames random shaking

  var timer = balloonSpeed * Date.now();

  dx = ( mouseX - camera.position.x ) * .05
  dy = ( - mouseY - camera.position.y ) * .05;

  time += clock.getDelta();

  if(allFlameMaterials.length > 0) {
    allFlameMaterials.map(function(flameMaterial, i) {
      flameMaterial[0].uniforms.time.value = time + i;
    })
  }


  // Balloon random movement

  for ( var i = 0, il = spheres.length; i < il; i ++ ) {
    var sphere = spheres[ i ];
    sphere.position.x = 500 * Math.cos( timer + i );
    sphere.position.y = 200 * Math.sin( timer + i * 1.1 );
  }


  // camera mouse animation

  camera.position.x += dx;
  camera.position.y += dy;

  camera.lookAt( scene.position );

  renderer.setClearColor("#000000");
  renderer.render(scene, camera);
};


init();
geoletters();
render();

