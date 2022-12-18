import * as THREE from 'three'
import CANNON from 'cannon-es'
import Table from './src/PoolTable.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2
const renderer = new THREE.WebGLRenderer()
var debug = false
// const Table = new Table(world, debug);
var world = new CANNON.World();
world.gravity.set(0, 0, -9.82);
scene.add(Table);
var controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    // stats.update()
}

function render() {
    renderer.render(scene, camera)
    world.step(1 / 60)
    Table.update()
}
