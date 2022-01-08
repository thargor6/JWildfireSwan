
import {initGL} from './shader_utils'
import {Shaders} from './shaders'
import {Buffers} from "./buffers";
import {Textures} from './textures'
import {Framebuffers} from './framebuffers'
import {FlameRenderContext} from "Frontend/flames/renderer/render_context";
import {FlameRenderSettings} from "Frontend/flames/renderer/render_settings";
import {FlameRendererDisplay} from "Frontend/flames/renderer/display";
import {FlameIterator} from "Frontend/flames/renderer/iterator";


window.requestAnimFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback, element) { setTimeout(callback, 1000 / 60); };

var fps = 0;
let frames = 0;

var time = 0.0;
var frameCounter = 0;



function drawScene(ctx: FlameRenderContext, settings: FlameRenderSettings, iterator: FlameIterator, display: FlameRendererDisplay) {
   settings.frames = frames;
   settings.brightness = brightnessElement.value;


    settings.time += 0.01;
    //
    iterator.iterateIFS();

    //
    if(frames > 20) {
        iterator.plotHistogram();
    }

    //
    var displayMode = getRadioValue(radioButtonElements);

    switch(displayMode) {
        case "flame": display.displayFlame(); break;
        case "position": display.displayPosition(); break;
        case "colour": display.displayColour(); break;
    }

    //
    fps++;
    frames++;

    if(frames<2500)
      window.requestAnimFrame(drawScene.bind(this, ctx, settings, iterator, display));
}

function save() {
    //
    var imgData = canvas.toDataURL();

    //
    var imgElement = document.createElement('img');
    imgElement.src = imgData;

    //
    document.body.appendChild(imgElement);
}

window.save = save;

function getRadioValue(radioButtonElements) {
    for(var i = 0; i < radioButtonElements.length; i++) {
        var radioButtonElement = radioButtonElements[i];

        if(radioButtonElement.checked)
            return radioButtonElement.value;
    }
}

var gl: WebGLRenderingContext;
var canvas: HTMLCanvasElement;
var grid_size: number;
var canvas_size = grid_size = 512;
var points_size = 512;
var brightnessElement, radioButtonElements, fpsCounterElement, param1Element: HTMLElement;

export function main(_canvas: HTMLCanvasElement, _brightnessElement: HTMLElement, _radioButtonElements: any, _fpsCounterElement: HTMLElement, _param1Element: HTMLElement) {
    canvas = _canvas;
    brightnessElement = _brightnessElement;
    radioButtonElements = _radioButtonElements;
    fpsCounterElement = _fpsCounterElement;
    param1Element = _param1Element;


    canvas.width = canvas_size;
    canvas.height = canvas_size;

    setInterval(function() {
          console.log(fps + " fps");

        fps = 0;
    }, 1000);

    gl = initGL(canvas);

    const shaders = new Shaders(gl, canvas, points_size);

    let buffers = new Buffers();
    buffers.initBuffers(gl, shaders, points_size);

    const textures = new Textures(gl, points_size, grid_size);
    const framebuffers = new Framebuffers(gl, textures);
    const ctx = new FlameRenderContext(gl, shaders, buffers, textures, framebuffers)
    const settings = new FlameRenderSettings(1.2, canvas_size, points_size, 1, 0.0)
    const display = new FlameRendererDisplay(ctx, settings)
    const iterator = new FlameIterator(ctx, settings)
    drawScene(ctx, settings, iterator, display);
}
