import CANNON from 'cannon-es';
import Table from './PoolTable.js';

class LongWall {
    constructor() {
        this.height = 2;
        this.thickness = 2.5;
        
        this.body = new CANNON.Body({
            mass: 0,
            material: Table.wallContactMaterial
        });
    }
}