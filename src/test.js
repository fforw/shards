import * as THREE from "three"

var createOrbitViewer = require('three-orbit-viewer')(THREE)
var createBackground = require('three-vignette-background')

var app = createOrbitViewer({
    clearColor: 'rgb(40, 40, 40)',
    clearAlpha: 1.0,
    fov: 55,
    position: new THREE.Vector3(0, 2, -2)
})

// add a default background
var background = createBackground()
app.scene.add(background)
