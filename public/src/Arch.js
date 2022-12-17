// import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Table from './PoolTable.js';
import Ball from './Ball.js';
import { createQuaternionFromAxisAngle } from './CannonUtils.js';

class Arch {
    constructor(params) {
        this.body = new CANNON.body({
            mass: 0,
            material: Table.floorContactMaterial,
        })
        if (params == null){
            params = {};
        }
        this.position = params.position || { x: 0, y: 0, z: 0};
        this.radius = params.radius || Ball.RADIUS + 2;
        this.box_autowidth = params.box_autowidth || false;
        this.box_width = params.box_width || 2;
        this.box_height = params.box_height || 5;
        this.box_thickness = params.box_thickness || 2;
        this.no_of_boxes = params.no_of_boxes || 5;
        this.body.position.set(this.position.x, this.position.y, this.position.z);
        var y_axis = new CANNON.Vec3(0, 1, 0);
        this.body.quaternion.setFromAxisAngle(y_axis, Math.PI);
        var box_increment_angle = Math.PI / (2 * this.no_of_boxes);
        var x_len = this.radius * Math.tan(box_increment_angle);
        if (!this.box_autowidth) {
            x_len = this.box_width;
        }
        var shape = new CANNON.Box(new CANNON.Vec3(x_len, this.box_height, this.box_thickness));
        for (var i = 0; i < this.no_of_boxes; i++) {
            var angle = box_increment_angle + (i * Math.PI / this.no_of_boxes);
            var b_x = Math.cos(angle);
            var b_z = Math.sin(angle);
        
            b_x *= this.radius + this.box_thickness;
            b_z *= this.radius + this.box_thickness;
        
            this.body.addShape(shape,
              new CANNON.Vec3(b_x, 0, b_z),
              createQuaternionFromAxisAngle(y_axis, Math.PI / 2 - angle));
        }
    }

}