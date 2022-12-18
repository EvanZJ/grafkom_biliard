import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Hole from './Hole.js'
import LongWall from './LongWall.js'
import ShortWall from './ShortWall.js'
import { addCannonVisual } from './CannonUtils.js'

class Table {
    constructor(world, debug) {
        this.floorContactMaterial = new CANNON.Material('floorMaterial');
        this.wallContactMaterial = new CANNON.Material('wallMaterial');
        this.LEN_Z = 137.16;
        this.LEN_X = 274.32;
        this.WALL_HEIGHT = 6;
        this.TABLE_COLORS = {
            cloth: 0x4d9900
        };

        this.rigidBody = this.createFloor(world, debug);
        //corner holes
        this.hole1 = new Hole( this.LEN_X / 2 + 1.5, 0, -this.LEN_Z / 2 - 1.5,  Math.PI / 4);
        this.hole2 = new Hole(-this.LEN_X / 2 - 1.5, 0, -this.LEN_Z / 2 - 1.5, -Math.PI / 4);
        //middle holes
        this.hole3 = new Hole(0, 0, -this.LEN_Z / 2 - 4.8, 0);
        this.hole4 = new Hole(0, 0,  this.LEN_Z / 2 + 4.8, Math.PI);
        //side holes
        this.hole5 = new Hole( this.LEN_X / 2 + 1.5, 0, this.LEN_Z / 2 + 1.5,  3 * Math.PI / 4);
        this.hole6 = new Hole(-this.LEN_X / 2 - 1.5, 0, this.LEN_Z / 2 + 1.5, -3 * Math.PI / 4);

        this.walls = this.createWallBodies(world, debug);

        var loader = new THREE.JSONLoader();
        loader.load('./json/table/base.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                color: new THREE.Color(0x000000),
                specular: 0x404040,
                shininess: 20,
                shading: THREE.SmoothShading
            }));
        
            mesh.position.x = mesh_x;
            mesh.position.y = mesh_y;
            mesh.position.z = mesh_z;
            mesh.scale.set(100, 100, 100);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);
        });
        
        loader.load('./json/table/felt.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                color: new THREE.Color(TABLE_COLORS.cloth),
                specular: 0x404040,
                shininess: 10,
                shading: THREE.SmoothShading
            }));
        
            mesh.position.x = mesh_x;
            mesh.position.y = mesh_y;
            mesh.position.z = mesh_z;
            mesh.scale.set(100, 100, 100);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);
        });
        
        loader.load('./json/table/edges.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                color: new THREE.Color(0x7a5230),
                specular: 0x404040,
                shininess: 100,
                shading: THREE.SmoothShading
            }));
        
            mesh.position.x = mesh_x;
            mesh.position.y = mesh_y;
            mesh.position.z = mesh_z;
            mesh.scale.set(100, 100, 100);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);
        });
        
        loader.load('./json/table/pockets.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                color: new THREE.Color(0x7a5230),
                specular: 0x3D3D3D,
                shininess: 20,
                shading: THREE.SmoothShading
            }));
        
            mesh.position.x = mesh_x;
            mesh.position.y = mesh_y;
            mesh.position.z = mesh_z;
            mesh.scale.set(100, 100, 100);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);
        });
        
        loader.load('./json/table/pocket_bottoms.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                color: new THREE.Color(0x000),
                specular: 0x000,
                shininess: 0,
                shading: THREE.SmoothShading
            }));
        
            mesh.position.x = mesh_x;
            mesh.position.y = mesh_y;
            mesh.position.z = mesh_z;
            mesh.scale.set(100, 100, 100);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);
        });
    }

}

Table.prototype.createFloor = function (world, debug) {
    var narrowStripWidth = 2;
    var narrowStripLength = Table.LEN_Z / 2 - 5;
    var floorThickness = 1;
    var mainAreaX = Table.LEN_X / 2 - 2 * narrowStripWidth;
  
    var floorBox = new CANNON.Box(new CANNON.Vec3(mainAreaX, floorThickness, Table.LEN_Z / 2));
    var floorBoxSmall = new CANNON.Box(new CANNON.Vec3(narrowStripWidth, floorThickness, narrowStripLength));
  
    this.body = new CANNON.Body({
      mass: 0, // mass == 0 makes the body static
      material: Table.floorContactMaterial
    });
    this.body.addShape(floorBox,      new CANNON.Vec3(0, -floorThickness, 0));
    this.body.addShape(floorBoxSmall, new CANNON.Vec3(-mainAreaX - narrowStripWidth, -floorThickness, 0));
    this.body.addShape(floorBoxSmall, new CANNON.Vec3( mainAreaX + narrowStripWidth, -floorThickness, 0));
  
    if (debug) {
      addCannonVisual(this.body, 0xff0000);
    }
    world.add(this.body);
};

Table.prototype.createWallBodies = function (world, debug) {
    //walls of -z
    var wall1 = new LongWall( Table.LEN_X / 4 - 0.8, 2, -Table.LEN_Z / 2, 61);
    var wall2 = new LongWall(-Table.LEN_X / 4 + 0.8, 2, -Table.LEN_Z / 2, 61);
    wall2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI);
  
    //walls of -z
    var wall3 = new LongWall( Table.LEN_X / 4 - 0.8, 2, Table.LEN_Z / 2, 61);
    var wall4 = new LongWall(-Table.LEN_X / 4 + 0.8, 2, Table.LEN_Z / 2, 61);
    wall3.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0),  Math.PI);
    wall4.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);
  
    //wall of +x
    var wall5 = new ShortWall(Table.LEN_X / 2, 2, 0, 60.5);
  
    //wall of -x
    var wall6 = new ShortWall(-Table.LEN_X / 2, 2, 0, 60.5);
    wall6.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.5 * Math.PI);
  
    var walls = [wall1, wall2, wall3, wall4, wall5, wall6];
    for (var i in walls) {
      world.addBody(walls[i].body);
      if (debug) {
        addCannonVisual(walls[i].body);
      }
    }
  
    return walls;
};

export default Table;