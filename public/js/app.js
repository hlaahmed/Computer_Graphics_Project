import  draw from './mygrass.js'
import  {Sky}  from './Sky.js';
import  {grass}  from './mygrass.js';
import  {ground}  from './mygrass.js';
import  {GUI}  from './dat.gui.module.js';
import  {OrbitControls}  from './OrbitControls.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/TrackballControls.js';

let 
  cloudParticles = [],
  flash,
  rain,
  rainCount = 15000;
  var rainGeo;

const params = {
     exposure: 1,
     bloomStrength: 1.5,
     bloomThreshold: 0,
     bloomRadius: 0
};
function getRandomArbitrary(min, max) {
     return Math.random() * (max - min) + min;
   }
var camera, scene, renderer, effectController, uniforms;
var  ambientLight, light;
var keyboard = {};
var player = {
     height: 13,
     MovementSpeed: 0.1,
     RotationSpeed: 0.01
}
var fireflies = [];
var galaxyBox;
let sky, sun;
var numFireflies = 500;
var nucleus;
var IsFirefliesExist = false;
var boolNight = false;
var boolMorning = false;



function GlowObject(mesh){
     
	// SUPER SIMPLE GLOW EFFECT
	// use sprite because it appears the same from all angles
	var spriteMaterial = new THREE.SpriteMaterial( 
          { 
               map: new THREE.ImageUtils.loadTexture( 'js/sprites/glow.png' ), 
               color: 0xF1EB1C, transparent: true, blending: THREE.AdditiveBlending
          });
          var sprite = new THREE.Sprite( spriteMaterial );
          sprite.scale.set(500, 500, 500);
          sprite.position.set(0, 0, -500);
          mesh.add(sprite);
          
}



function createScene(){
     scene = new THREE.Scene();
     camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
     );
       // Position camera
       camera.position.set(-50,player.height,150);
       //camera.position.set(-900,-200,-900);
       camera.lookAt(new THREE.Vector3(0,player.height,0));
       renderer = new THREE.WebGLRenderer({ antialias: true });
       renderer.setSize(window.innerWidth, window.innerHeight);    
       //shadow
       renderer.shadowMap.enabled = true;
       renderer.shadowMap.type = THREE.PCFSoftShadowMap;
       
       document.body.appendChild(renderer.domElement);
     //   const axesHelper = new THREE.AxesHelper( 5 );
     //      scene.add( axesHelper );
          rainfn(); 
          rain.traverse( function ( object ) { object.visible = false;});
          
          
	
}
function createSkybox(){
 //Skybox
     var imagePrefix = "/skybox/";
	var directions  = ["left","right","down","up","back","front" ];
	var imageSuffix = ".png";
	var skyGeometry = new THREE.CubeGeometry( 1000, 1000, 1000 );	
	
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
               side: THREE.BackSide,
               opacity: 0.7,
               transparent: true 
		}));
     var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    
	galaxyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( galaxyBox );

}

function loadHouse(){
    
     const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('js/models/house2/WoodHouse.glb', function ( object ) {
          
     
          var model = object.scene;
          model.scale.set(20,20,20);
          model.position.set(50,5,10);
          scene.add(model);
      
     }, undefined, function ( e ) {
      
       console.error( e );
      
     } );
   } 
function loadcow(){
    
     const gltfLoader = new THREE.GLTFLoader();
     gltfLoader.load('js/models/cow/scene.gltf', function ( object ) {
          
          var model = object.scene;
          model.scale.set(2.5,2.5,2.5);
          model.position.set(-50,2,90);
          scene.add(model);
      
     }, undefined, function ( e ) {
      
       console.error( e );
      
     } );
     //-----------------------
     gltfLoader.load('js/models/cow/scene.gltf', function ( object ) {
          
          var model = object.scene;
          model.scale.set(3,3,3);
          model.position.set(-100,5,80);
          scene.add(model);
      
     }, undefined, function ( e ) {
      
       console.error( e );
      
     } );
   } 

function createLight(){
     
     //ambient light
     ambientLight = new THREE.AmbientLight(0xffffff);
     scene.add(ambientLight);
     light = new THREE.DirectionalLight(0xB5E0D4);
     light.position.set(-3,50,-3);
     light.castShadow = true;
     light.shadow.camera.near = 0.1;
     light.shadow.camera.far = 25;
     light.shadow.mapSize.width = 1024; // default is 512
     light.shadow.mapSize.height = 1024; // default is 512
     scene.add(light); 
     
}


 function rainfn(){
  var directionalLight = new THREE.DirectionalLight(0xffeedd);
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);
  flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
  flash.position.set(200, 300, 100);
  scene.add(flash);
  scene.fog = new THREE.FogExp2(0x11111f, 0.002);
 rainGeo = new THREE.Geometry();
  for (let i = 0; i < rainCount; i++) {
    var rainDrop = new THREE.Vector3(
      Math.random() * 400 - 200,
      Math.random() * 500 - 250,
      Math.random() * 400 - 200
    );
    rainDrop.velocity = {};
    rainDrop.velocity = 0;
    rainGeo.vertices.push(rainDrop);
  }
  var rainMaterial = new THREE.PointsMaterial({
    color: 0x415D6F ,
    size: 0.01,
    transparent: true
  });
  rain = new THREE.Points(rainGeo, rainMaterial);
  scene.add(rain);
  let loader = new THREE.TextureLoader();
  loader.load('js/sprites/smoke.png', function(texture) {
    cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
    cloudMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true
    });
    for (let p = 0; p < 25; p++) {
      let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(
        Math.random() * 800 - 400,
        500,
        Math.random() * 500 - 450
      );
      cloud.rotation.x = 1.16;
      cloud.rotation.y = -0.12;
      cloud.rotation.z = Math.random() * 360;
      cloud.material.opacity = 0.6;
      cloudParticles.push(cloud);
      scene.add(cloud);
    }
    
  });
}  

   function rainanimate(){
     cloudParticles.forEach(p => {
          p.rotation.z -= 0.002;
        });
        rainGeo.vertices.forEach(p => {
          p.velocity -= 0.1 + Math.random() * 0.1;
          p.y += p.velocity;
          if (p.y < -200) {
            p.y = 200;
            p.velocity = 0;
          }
        });
        rainGeo.verticesNeedUpdate = true;
        rain.rotation.y += 0.002;
        if (Math.random() > 0.93 || flash.power > 100) {
          if (flash.power < 100)
            flash.position.set(Math.random() * 400, 300 + Math.random() * 200, 100);
          flash.power = 50 + Math.random() * 500;
        }
        

      }

  
var rainsound;
var morningsound;
	

function nightSound(){
     var audioListener_2 = new THREE.AudioListener();
     camera.add(audioListener_2);
     rainsound = new THREE.Audio(audioListener_2);
     var audioLoader_2 = new THREE.AudioLoader();
     audioLoader_2.load('js/sounds/rain.mp3', function(buffer) {
     rainsound.setBuffer(buffer);
     rainsound.setLoop(true);
     rainsound.setVolume(1.5);

     });
}

function morningSound(){
     var audioListener_2 = new THREE.AudioListener();
     camera.add(audioListener_2);
     morningsound = new THREE.Audio(audioListener_2);
     var audioLoader_2 = new THREE.AudioLoader();
     audioLoader_2.load('js/sounds/morning.mp3', function(buffer) {
          morningsound.setBuffer(buffer);
          morningsound.setLoop(true);
          morningsound.setVolume(1.5);
          
        });
}

function initSky() {
     
     // Add Sky
     sky = new Sky();
     sky.scale.setScalar( 450000 );
     scene.add( sky );

     sun = new THREE.Vector3();

     /// GUI

      effectController = {
          turbidity: 10,
          rayleigh: 3,
          mieCoefficient: 0.062,
          mieDirectionalG: 0.377,
          inclination: 0.49, // elevation / inclination
          azimuth: 0.2256, // Facing front,
          exposure: renderer.toneMappingExposure
     };
     
           uniforms = sky.material.uniforms;
          uniforms[ "turbidity" ].value = effectController.turbidity;
          uniforms[ "rayleigh" ].value = effectController.rayleigh;
          uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
          uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;

          renderer.toneMappingExposure = effectController.exposure;
          renderer.render( scene, camera );
          const theta = Math.PI * ( effectController.inclination - 0.5 );
          const phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
          sun.x = Math.cos( phi );
          sun.y = Math.sin( phi ) * Math.sin( theta );
          sun.z = Math.sin( phi ) * Math.cos( theta );
          uniforms[ "sunPosition" ].value.copy( sun );
          const gui = new GUI();
          
          var nightBtn = {
               add: function() {
                    //alert("clicked!")
                    boolNight = true;
                    boolMorning = false;
                    rainBool = true;
                    rainsound.play(); 
                    morningsound.stop();                                                             
               }
             };
          var morningtBtn = {
          add: function() {
               boolNight = false;
               boolMorning = true;
               rainBool = false;
               IsRainExist = false; 
               rain.traverse( function ( object ) { object.visible = false;});
               rainsound.stop();  
               morningsound.play();                                    
          }
          };
          var ambienceBtn = {
               add: function() {
                    if(!boolNight){
                         morningsound.play();
                    }                                    
               }
               };
          gui.add(nightBtn, "add").name("Night");
          gui.add(morningtBtn, "add").name("Morning");
          gui.add(ambienceBtn, "add").name("Ambience");
			
     }


function loadFireflies(){
     var geo = new THREE.BoxGeometry(1, 5, 5);
     var mat = new THREE.MeshPhongMaterial({ opacity: 0.0,transparent: true });
     nucleus = new THREE.Mesh(geo, mat);
     nucleus.position.set(-50, 10, 100); // you can change these values
     nucleus.rotation.set(0, 0, 30);
     nucleus.scale.set(0,0, 0);
     scene.add(nucleus);
     var i = 0;
     var plane = new THREE.Plane();
     var point = new THREE.Vector3();
     for (i = 0; i < numFireflies; i++) {
     //      const gltfLoader = new THREE.GLTFLoader();
     //     gltfLoader.load( 'fireflysculpt/scene.gltf', function ( object ) {
               
               var geo = new THREE.BoxGeometry(1, 5, 5);
               var mat = new THREE.MeshPhongMaterial({ opacity: 0.0,transparent: true });
               var firefly = new THREE.Mesh(geo, mat);
               var model = firefly
               // var model = object.scene;
               model.scale.set(0.0005,0.0005,0.0005);
               //model.position.set(160,getRandomArbitrary(2,5),-150);
               model.position.set(getRandomArbitrary(-5,5),getRandomArbitrary(2,5),getRandomArbitrary(2,4));
               scene.add(model);
               GlowObject(model);
               fireflies.push(model); 
               //fireflies[i] = model;
               model.angle = new THREE.Vector3(
                    Math.random(),
                    Math.random(),
                    Math.random()
                    ).normalize();
                    model.orbitSpeed = (Math.random() * 0.005) + 0.005;
               if(Math.random() > 0.5) model.orbitSpeed *= -1;
               plane.normal.copy(model.angle);
               point.set(Math.random(), Math.random(), Math.random());
               plane.projectPoint(point, model.position);
               model.position.setLength(Math.floor(Math.random() * 15) + 10);
               model.position.applyAxisAngle(model.angle, Math.random() / 5);
               model.position.add(nucleus.position);
               
          // }, undefined, function ( e ) {
               
          //   console.error( e );
               
          // } );
          }       
}

function loadTrees(){
     const gltfLoader = new THREE.GLTFLoader();
         gltfLoader.load( 'js/models/tree2/scene.gltf', function ( object ) {
               
          
               var model = object.scene;
               model.scale.set(25,25,25);
               model.position.set(10,-0.5,-30);
               scene.add(model);
           
          }, undefined, function ( e ) {
           
            console.error( e );
           
          } );
        
         gltfLoader.load( 'js/models/tree2/scene.gltf', function ( object ) {
               
          
               var model = object.scene;
               model.scale.set(25,25,25);
               model.position.set(10,-0.5,150);
               scene.add(model);
           
          }, undefined, function ( e ) {
           
            console.error( e );
           
          } );

          gltfLoader.load( 'js/models/tree2/scene.gltf', function ( object ) {
               
          
               var model = object.scene;
               model.scale.set(25,25,25);
               model.position.set(-50,-0.5,80);
               scene.add(model);
           
          }, undefined, function ( e ) {
           
            console.error( e );
           
          } );
          
          gltfLoader.load( 'js/models/tree2/scene.gltf', function ( object ) {
               
          
               var model = object.scene;
               model.scale.set(25,25,25);
               model.position.set(100,-0.3,40);
               scene.add(model);
           
          }, undefined, function ( e ) {
           
            console.error( e );
           
          } );
          gltfLoader.load( 'js/models/tree2/scene.gltf', function ( object ) {
               
          
               var model = object.scene;
               model.scale.set(25,25,25);
               model.position.set(-100,-0.3,150);
               scene.add(model);
           
          }, undefined, function ( e ) {
           
            console.error( e );
           
          } );
        } 

// function playerMovement(){
 
//      if(keyboard[37]){ //left arrow key
//           camera.rotation.y -= player.RotationSpeed;
//      }
//      if(keyboard[39]){ //right arrow key
//           camera.rotation.y += player.RotationSpeed;
//      }
//      if(keyboard[38]){ //up arrow key
//           camera.rotation.x -= player.RotationSpeed;
//      }
//      if(keyboard[40]){ //down arrow key
//           camera.rotation.x += player.RotationSpeed;
//      }

//      //Player Movement
//      if(keyboard[87]){ // W key
//           camera.position.x += Math.sin(camera.rotation.y) * player.MovementSpeed;
//           camera.position.z += -Math.cos(camera.rotation.y) * player.MovementSpeed;
//      }
//      if(keyboard[83]){ // S key
//           camera.position.x -= Math.sin(camera.rotation.y) * player.MovementSpeed;
//           camera.position.z -= -Math.cos(camera.rotation.y) * player.MovementSpeed;
//      }
//      if(keyboard[65]){ // A key
//           camera.position.x -= Math.sin(camera.rotation.y + Math.PI/2) * player.MovementSpeed;
//           camera.position.z -= -Math.cos(camera.rotation.y + Math.PI/2) * player.MovementSpeed;
//      }
//      if(keyboard[68]){ // D key
//           camera.position.x -= Math.sin(camera.rotation.y - Math.PI/2) * player.MovementSpeed;
//           camera.position.z -= -Math.cos(camera.rotation.y - Math.PI/2) * player.MovementSpeed;
//      }
    
// }

function updateSunset(){
     effectController["inclination"] += 0.0004;
     const theta = Math.PI * ( effectController.inclination - 0.5 );
     const phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
     sun.x = Math.cos( phi );
     sun.y = Math.sin( phi ) * Math.sin( theta );
     sun.z = Math.sin( phi ) * Math.cos( theta );
     uniforms[ "sunPosition" ].value.copy( sun );

}

function updateSunrise(){
     effectController["inclination"] -= 0.0004;
     const theta = Math.PI * ( effectController.inclination - 0.5 );
     const phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
     sun.x = Math.cos( phi );
     sun.y = Math.sin( phi ) * Math.sin( theta );
     sun.z = Math.sin( phi ) * Math.cos( theta );
     uniforms[ "sunPosition" ].value.copy( sun );

}
function updateFireflies(){
     var obj = null;
     for(var i = 0; i < numFireflies; ++i){
         obj = fireflies[i]
         obj.position.sub(nucleus.position);
         obj.position.applyAxisAngle(obj.angle, obj.orbitSpeed);
         obj.position.add(nucleus.position);
     }
   }

var rainBool = false;
var IsRainExist = false;
// Draw the scene every time the screen is refreshed
function animate() {
	requestAnimationFrame(animate);
   
     //playerMovement();
     if(boolNight){
          if(effectController["inclination"] < 0.52){
               updateSunset();
          }
          else if (!IsFirefliesExist){
               //createSkybox();
               loadFireflies(); 
               IsFirefliesExist = true;  
          }
          if(IsFirefliesExist){
               updateFireflies();                            
          }                                     
     }
     if(boolMorning){
          if(IsFirefliesExist){
               for(var i = 0; i < numFireflies;i++){
                    fireflies[i].geometry.dispose();
                    fireflies[i].material.dispose();              
                    scene.remove( fireflies[i] );
                    scene.remove(galaxyBox );                                  
                    if(i == numFireflies - 1)  {
                         IsFirefliesExist = false; 
                         fireflies = []
                    }
                                
               }
          }       
          if(effectController["inclination"] > 0.49){
               updateSunrise();
          }                                              
     }        
     //skyBox.rotation.x += getRandomArbitrary(0.001, 0.005)*0.05;
     draw();
     
     if(rainBool){
         
          if(!IsRainExist){
               rain.traverse( function ( object ) { object.visible = true;});             
               IsRainExist = true; 
          }
          rainanimate();
     }
     
	renderer.render(scene, camera);
}

function onWindowResize() {
	// Camera frustum aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function keyDown(event){
    keyboard[event.keyCode] = true; 
}
function keyUp(event){
     keyboard[event.keyCode] = false; 
}



//OrbitControls.js for camera manipulation
// var controls = new OrbitControls(camera, renderer.domElement);
// controls.autoRotateSpeed = 0.5;
function init(){
     window.addEventListener('keydown', keyDown);
     window.addEventListener('keyup', keyUp);
     window.addEventListener('resize', onWindowResize, false);
     
     createScene();
     createLight();
     initSky();
     
     animate();
     grass.frustumCulled = false;
     scene.add(grass);
     scene.add(ground);
     loadTrees();
     loadHouse();
     loadcow();
     
     morningSound();
     nightSound();
     const controls = new OrbitControls( camera, renderer.domElement );

     //controls.update() must be called after any manual changes to the camera's transform
     camera.position.set( 0, 20, 100 );
     controls.update();
     
}
function onDocumentMouseMove(event) {

     event.preventDefault();
  
     if (isMouseDown) {
  
        theta = -((event.clientX - onMouseDownPosition.x) * 0.5) +
           onMouseDownTheta;
        phi = ((event.clientY - onMouseDownPosition.y) * 0.5) +
           onMouseDownPhi;
  
        phi = Math.min(180, Math.max(0, phi));
  
        camera.position.x = radious * Math.sin(theta * Math.PI / 360) *
           Math.cos(phi * Math.PI / 360);
        camera.position.y = radious * Math.sin(phi * Math.PI / 360);
        camera.position.z = radious * Math.cos(theta * Math.PI / 360) *
           Math.cos(phi * Math.PI / 360);
        camera.updateMatrix();
  
     }
  
     mouse3D = projector.unprojectVector(
        new THREE.Vector3(
           (event.clientX / renderer.domElement.width) * 2 - 1,
           -(event.clientY / renderer.domElement.height) * 2 + 1,
           0.5
        ),
        camera
     );
     ray.direction = mouse3D.subSelf(camera.position).normalize();
  
     interact();
     render();
  
  }


init();
