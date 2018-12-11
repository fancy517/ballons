//Global variables
var scene, camera, renderer;
var geometry, texture, material, mesh, cake1, cakeModel, material_Cake1, mesh_Cake1;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


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
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 500 );
    scene.add(camera);

    camera.position.z = 20;
    camera.position.y = 0;

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
    var path = "textures/cube/MilkyWay/dark-s_";
    var format = '.jpg';
    var urls = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ];
    var textureCube = new THREE.CubeTextureLoader().load( urls );
    textureCube.format = THREE.RGBFormat;
    // scene = new THREE.Scene();
    scene.background = textureCube;


    // Event handle

    window.addEventListener('resize', onWindowResize, false);


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

function geoletters() {
  var loader = new THREE.FontLoader();
  loader.load(
    'fonts/gentilis_regular.typeface.json',
    function ( font ) {
    	var geometry = new THREE.TextGeometry( 'Happy Birthday!', {
    		font: font,
    		size: 50,
    		height: 5,
    		curveSegments: 12,
    		bevelEnabled: true,
    		bevelThickness: 10,
    		bevelSize: 1,
    		bevelSegments: 5
    	});

      material = new THREE.MeshBasicMaterial( { color: "#FF00FF" } );
      mesh = new THREE.Mesh( geometry, material );
      mesh.position.z = -70;
      mesh.position.y = 0;
      mesh.position.x = -100;
      // scene.add( mesh );
    }
  );

  cakeModel = new THREE.Object3D();

  scene.add(cakeModel);
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

          camera.lookAt( cakeModel.position );
          placeFlames();
        });
    })
}

var allFlameMaterials = [];
var flames = [];
var r = 11;
var initialAngle = -2;

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
  scene.add(caseMesh);
}


function placeFlames() {
  // flame
  console.log("Placing flames");
  for(var i = 0; i < 16; i ++) {
    a = THREE.Math.degToRad(360 / 16 * i) + cakeModel.rotation.z;
    x = r * Math.cos(a);
    z = r * Math.sin(a);
    flame(true, x, z);
  }
}


document.addEventListener( 'mousemove', onDocumentMouseMove, false );

function onDocumentMouseMove( event ) {
  mouseX = ( event.clientX - windowHalfX ) / 5;
  mouseY = ( event.clientY - windowHalfY ) / 5;
}

var dx, dy, dz;
var clock = new THREE.Clock();
var time = 0;


var rotWorldMatrix;

// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiplySelf(object.matrix);        // pre-multiply
    object.matrix = rotWorldMatrix;
    object.rotation.getRotationFromMatrix(object.matrix, object.scale);
}


//Render Loop
var render = function () {
  requestAnimationFrame( render );

  // cakeModel.rotation.x -= 0.0020;
  // cakeModel.rotation.z -= 0.0030;
  // rotateAroundWorldAxis(cakeModel, new THREE.Vector3(1,0,0), cakeModel.rotation.z + 0.0030);


  // flames random shaking

  dx = ( mouseX - camera.position.x ) * .05
  dy = ( - mouseY - camera.position.y ) * .05;

  time += clock.getDelta();
  flames.map(function(f, i) {
    a = THREE.Math.degToRad(360 / 16 * i + initialAngle) + cakeModel.rotation.z;
    x = r * Math.sin(a);
    z = r * Math.cos(a);
    nx = x + dx
    f.position.x = x;
    f.position.z = z;
  })
  if(allFlameMaterials.length > 0) {
    allFlameMaterials.map(function(flameMaterial, i) {
      flameMaterial[0].uniforms.time.value = time + i;
    })
  }


  // camera mouse animation

  // camera.position.x += dx;
  // camera.position.y += dy;

  // camera.lookAt( scene.position );

  renderer.setClearColor("#000000");
  renderer.render(scene, camera);
};


init();
geoletters();
render();


function getFlameMaterial(isFrontSide){
  let side = isFrontSide ? THREE.FrontSide : THREE.BackSide;
  return new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0}
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float hValue;

      //https://thebookofshaders.com/11/
      // 2D Random
      float random (in vec2 st) {
          return fract(sin(dot(st.xy,
                               vec2(12.9898,78.233)))
                       * 43758.5453123);
      }

      // 2D Noise based on Morgan McGuire @morgan3d
      // https://www.shadertoy.com/view/4dS3Wd
      float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);

          // Four corners in 2D of a tile
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));

          // Smooth Interpolation

          // Cubic Hermine Curve.  Same as SmoothStep()
          vec2 u = f*f*(3.0-2.0*f);
          // u = smoothstep(0.,1.,f);

          // Mix 4 coorners percentages
          return mix(a, b, u.x) +
                  (c - a)* u.y * (1.0 - u.x) +
                  (d - b) * u.x * u.y;
      }

      void main() {
        vUv = uv;
        vec3 pos = position;

        pos *= vec3(0.8, 2, 0.725);
        hValue = position.y;
        //float sinT = sin(time * 2.) * 0.5 + 0.5;
        float posXZlen = length(position.xz);

        pos.y *= 1. + (cos((posXZlen + 0.25) * 3.1415926) * 0.25 + noise(vec2(0, time)) * 0.125 + noise(vec2(position.x + time, position.z + time)) * 0.5) * position.y; // flame height

        pos.x += noise(vec2(time * 2., (position.y - time) * 4.0)) * hValue * 0.0312; // flame trembling
        pos.z += noise(vec2((position.y - time) * 4.0, time * 2.)) * hValue * 0.0312; // flame trembling

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
      }
    `,
    fragmentShader: `
      varying float hValue;
      varying vec2 vUv;

      // honestly stolen from https://www.shadertoy.com/view/4dsSzr
      vec3 heatmapGradient(float t) {
        return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
      }

      void main() {
        float v = abs(smoothstep(0.0, 0.4, hValue) - 1.);
        float alpha = (1. - v) * 0.99; // bottom transparency
        alpha -= 1. - smoothstep(1.0, 0.97, hValue); // tip transparency
        gl_FragColor = vec4(heatmapGradient(smoothstep(0.0, 0.3, hValue)) * vec3(0.95,0.95,0.4), alpha) ;
        gl_FragColor.rgb = mix(vec3(0,0,1), gl_FragColor.rgb, smoothstep(0.0, 0.3, hValue)); // blueish for bottom
        gl_FragColor.rgb += vec3(1, 0.9, 0.5) * (1.25 - vUv.y); // make the midst brighter
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.66, 0.32, 0.03), smoothstep(0.95, 1., hValue)); // tip
      }
    `,
    transparent: true,
    side: side
  });
}
