var _size = 1080; //2000;

function buildCity() {
    // build the base geometry for each building
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    // translate the geometry to place the pivot point at the bottom instead of the center
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));

    var uv = geometry.faceVertexUvs[0];
    //console.log(uv);

    // get rid of the bottom faces (face indexes 6 & 7) - they are never seen
    geometry.faces.splice(6, 2);
    uv.splice(6, 2);
    
    // change UVs for the top faces (face indexes 4 & 5)
    // - it is the roof so it wont use the same texture as the side of the building
    // - set the UVs to the single coordinate 0,0. so the roof will be the same color
    //   as a floor row.
    //uv[4][0].set(0, 0);
    //uv[4][1].set(0, 0);
    //uv[4][2].set(0, 0);
    uv[4].concat(uv[5]).forEach(function(u) { u.set(0, 0); });
    
    // buildMesh
    var buildingMesh = new THREE.Mesh(geometry);

    // base colors for vertexColors. light is for vertices at the top, shaddow is for the ones at the bottom
    var light  = new THREE.Color(0xffffff);
    var shadow = new THREE.Color(0x303050);

    var cityGeometry = new THREE.Geometry();
    for (var i = (_size*_size/200); i--; ) {
        // put a random position
        buildingMesh.position.x = Math.floor(Math.random()*_size - _size/2);
        buildingMesh.position.z = Math.floor(Math.random()*_size - _size/2);
        // put a random rotation
        buildingMesh.rotation.y = Math.random() * Math.PI * 2;
        // put a random scale
        buildingMesh.scale.x = Math.random() * Math.random() * Math.random() * Math.random() * 50 + 10;
        buildingMesh.scale.y = (Math.random() * Math.random() * Math.random() * buildingMesh.scale.x) * 8 + 8;
        buildingMesh.scale.z = buildingMesh.scale.x

        // establish the base color for the buildingMesh
        var value = 1 - Math.random() * Math.random();
        //var baseColor = new THREE.Color().setRGB(value + Math.random() * 0.1, value, value + Math.random() * 0.1);
        var baseColor = new THREE.Color().setRGB(value + Math.random() * 0.1, value + Math.random() * 0.1, value + Math.random() * 0.1);
        // set topColor/bottom vertexColors as adjustement of baseColor
        var topColor    = baseColor.clone().multiply(light);
        var bottomColor = baseColor.clone().multiply(shadow);
        
        // set .vertexColors for each face
        var geometry = buildingMesh.geometry;
        geometry.faces.forEach(function(face, i) {
            // set face.vertexColors on root face
            if ((i === 4) || (i === 5)) {
                face.vertexColors = [baseColor, baseColor, baseColor];
            }
            // set face.vertexColors on sides faces
            else {
                face.vertexColors = (i % 2) ? [bottomColor, bottomColor, topColor]
                                            : [topColor,    bottomColor, topColor];
            }
        });

        //http://stackoverflow.com/questions/24422289/three-js-merging-geometries-and-mesh
        //
        //  // merge it with cityGeometry - very important for performance
        //  THREE.GeometryUtils.merge(cityGeometry, buildingMesh);
        //
        buildingMesh.updateMatrix();
        cityGeometry.merge( buildingMesh.geometry, buildingMesh.matrix );
    }

    // generate the texture
    var texture = new THREE.Texture(generateTexture());
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;

    // build the mesh
    var material = new THREE.MeshLambertMaterial({
        map: texture,
        vertexColors: THREE.VertexColors
    });
    var cityMesh = new THREE.Mesh(cityGeometry, material);
    return cityMesh;

    function generateTexture() {
        // build a small canvas 32x64 and paint it in white
        var canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 64;
        var context = canvas.getContext('2d');
        // plain it in white
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, 32, 64);
        // draw the window rows - with a small noise to simulate light variations in each room
        for (var y = 2; y < 64; y += 2) {
            for (var x = 0; x < 32; x += 2) {
                var value = Math.floor(Math.random() * 64);
                context.fillStyle = 'rgb(' + [value, value, value].join(',') + ')';
                context.fillRect(x, y, 2, 1);
            }
        }

        // build a bigger canvas and copy the small one in it
        // This is a trick to upscale the texture without filtering
        var canvas2 = document.createElement('canvas');
        canvas2.width = 512;
        canvas2.height = 1024;
        var context = canvas2.getContext('2d');
        
        // disable smoothing
        context.imageSmoothingEnabled = false;
        //context.webkitImageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        
        // then draw the image
        context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
        // return the just built canvas2
        //console.log(canvas2);
        return canvas2;
    }
}

var updateFcts = [];
var scene = new THREE.Scene(),
    mist = 0xdd4411; //'orangered';
scene.fog = new THREE.FogExp2(mist/*0xd0e0f0*/, 0.003);

var renderer = new THREE.WebGLRenderer({
    antialias: false
});
renderer.setSize(window.innerWidth-10, window.innerHeight);
document.body.appendChild(renderer.domElement);

//https://github.com/mrdoob/three.js/issues/4512
renderer.setClearColor(mist/*0xd8e7ff*/);

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, _size);
camera.position.y = 150;

//////////////////////////////////////////////////////////////////////////////////
//		add an object and make it move					//
//////////////////////////////////////////////////////////////////////////////////		
var light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
light.position.set(0.75, 1, 0.25);
scene.add(light);

var material = new THREE.MeshBasicMaterial({
    color: 0x101018
})
var geometry = new THREE.PlaneBufferGeometry(_size, _size)
var plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -90 * Math.PI / 180;
scene.add(plane);

//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////

var city = buildCity()
scene.add(city)

//////////////////////////////////////////////////////////////////////////////////
//		Camera Controls							//
//////////////////////////////////////////////////////////////////////////////////
var controls = new THREE.FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 20;
controls.lookSpeed = 0.05;
controls.lookVertical = true;
//http://stackoverflow.com/questions/14638135/firstpersoncontrols-start-by-looking-at-an-object
controls.lon = 45;
controls.lat = -25;

updateFcts.push(function(delta, now) {
    controls.update(delta);
})

//////////////////////////////////////////////////////////////////////////////////
//		render the scene						//
//////////////////////////////////////////////////////////////////////////////////
updateFcts.push(function() {
    renderer.render(scene, camera);
})

//////////////////////////////////////////////////////////////////////////////////
//		loop runner							//
//////////////////////////////////////////////////////////////////////////////////
var lastTimeMsec = null
requestAnimationFrame(function animate(nowMsec) {
    // keep looping
    requestAnimationFrame(animate);
    // measure time
    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec = nowMsec
        // call each update function
    updateFcts.forEach(function(updateFn) {
        updateFn(deltaMsec / 1000, nowMsec / 1000)
    })
})