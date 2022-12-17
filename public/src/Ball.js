class Ball {
    constructor(x, y, z, name, color) {
        Ball.RADIUS = 5.715 / 2; // cm
        Ball.MASS = 0.170; // kg
        Ball.contactMaterial = new CANNON.Material("ballMaterial");

        this.color = typeof color === 'undefined' ? 0xcc0000 : color; //default color
        this.texture = './images/balls/' + name + '.jpg';
        this.mesh = this.createMesh(x,y,z);

    }
}