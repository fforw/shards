import "./style.css"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import {
    ACESFilmicToneMapping,
    BoxBufferGeometry,
    EquirectangularReflectionMapping,
    Mesh,
    MeshPhysicalMaterial,
    PerspectiveCamera,
    Scene,
    sRGBEncoding,
    TextureLoader,
    WebGLRenderer
} from "three";

const TAU = Math.PI * 2;

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";


let camera, scene, renderer, stats,
    singleMaterial, zmaterial,
    parameters, nobjects;

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let width = window.innerWidth;
let height = window.innerHeight;

let controls;

const materials = [], objects = [];

const postprocessing = {};


function createShards()
{
    const pad = 2;

    const rnd = Math.random();

    const angle = TAU * Math.random();
    const rnd2 = Math.random()
    const r = 0 | size * Math.pow(rnd2, 2) + size/20;

    const bx = Math.cos(angle) * r;
    const by = Math.sin(angle) * r;

    const h = 0 | size/50 + size/4 * rnd * rnd * rnd;
    const span = h * (1 + Math.random())/(TAU * r);

    const count = 5;

    const hCount = count/2;

    const pts = [];
    const spanStep = span / count;
    const hStep = h/count;
    for (let y = 0; y < count; y++)
    {
        for (let x = -hCount; x < hCount; x++)
        {
            if (Math.random() < 0.3)
            {
                const a2 = angle + spanStep * x;
                const radius = r + y * hStep;

                const x1 = bx + Math.cos(a2) * radius;
                const y1 = by + Math.sin(a2) * radius;

                // dull the edges

                if (Math.random() < 0.7)
                {
                    pts.push({
                        x: x1 + pad,
                        y: y1
                    }, {
                        x: x1 - pad,
                        y: y1
                    }, {
                        x : x1,
                        y: y1 + pad,
                    }, {
                        x : x1,
                        y: y1 - pad
                    })
                }
                else
                {
                    pts.push({
                        x: x1,
                        y: y1
                    })
                }
            }
        }
    }

    const hull = QuickHull(pts);

    console.log("HULL", hull);

}


function init() {

    const container = document.getElementById( 'screen' );
    document.body.appendChild( container );

    camera = new PerspectiveCamera( 70, width / height, 0.01, 3000 );
    camera.position.z = 10;

    scene = new Scene();

    renderer = new WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    container.appendChild( renderer.domElement );


    // https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_physical_transmission.html

    const textureLoader = new TextureLoader();

    const textureEquirec = textureLoader.load( 'media/smooth-bg.jpg' );
    textureEquirec.mapping = EquirectangularReflectionMapping;
    //textureEquirec.encoding = sRGBEncoding;

    scene.background = textureEquirec

    const params = {
        envMap: textureEquirec,
        roughness: 0,
        transmission: 0.7,
        ior: 1.35,
        thickness: 0.01,
        specularIntensity: 1,
        specularColor: 0xffffff,
        envMapIntensity: 1.5,
        opacity: 0.7,
        transparent: true

    }


    const shards = createShards();
    {
        const cubeMaterial = new MeshPhysicalMaterial( {
            ... params,
            color: 0x000000
        });

        const geo = new BoxBufferGeometry(1,1,0.1)
        const mesh = new Mesh(geo, cubeMaterial)
        scene.add(mesh)
    }

    {
        const cubeMaterial = new MeshPhysicalMaterial( {
            ... params,
            color: 0xffcc00
        });

        const geo = new BoxBufferGeometry(1,1,0.1)
        const mesh = new Mesh(geo, cubeMaterial)
        mesh.position.x = -0.5;
        mesh.position.z = -0.5;
        scene.add(mesh)
    }


    initPostprocessing();

    renderer.autoClear = false;

    //stats = new Stats();
    //container.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize );

    controls = new OrbitControls(camera, renderer.domElement);
    //controls.maxPolarAngle = Math.PI * 0.45;
    controls.maxPolarAngle = Math.PI;
    controls.target.set(0, 0, 0);
    controls.minDistance = 0.2;
    controls.maxDistance = 10.0;
    controls.enableDamping = true;
    controls.dampingFactor = 0.02;
    controls.update();


}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    width = window.innerWidth;
    height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );

    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.outputEncoding = sRGBEncoding;

    postprocessing.composer.setSize( width, height );

}

function initPostprocessing() {

    const renderPass = new RenderPass( scene, camera );

    const bokehPass = new BokehPass( scene, camera, {
        focus: 1.0,
        aperture: 0.015,
        maxblur: 0.005,

        width: width,
        height: height
    } );

    const composer = new EffectComposer( renderer );

    composer.addPass( renderPass );
    composer.addPass( bokehPass );

    postprocessing.composer = composer;
    postprocessing.bokeh = bokehPass;

}

function animate() {

    requestAnimationFrame(animate);

    //stats.begin();
    const time = Date.now() * 0.00005;

    postprocessing.composer.render(0.1);
    //stats.end();

    controls.update()
}


init();
requestAnimationFrame(animate);
