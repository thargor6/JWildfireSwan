
import {initGL} from './shader_utils'
import {Shaders} from './shaders'
import {Buffers} from "./buffers";
import {Textures} from './textures'
import {Framebuffers} from './framebuffers'
import {FlameRenderContext} from "./render_context";
import {FlameRenderSettings} from "./render_settings";
import {FlameRendererDisplay} from "./display";
import {FlameIterator} from "./iterator";


export class FlameRenderer {
    frames = 0;
    grid_size: number = 512;
    canvas_size = this.grid_size;
    points_size = 128;

    ctx: FlameRenderContext;
    settings: FlameRenderSettings;
    iterator: FlameIterator;
    display: FlameRendererDisplay;

    constructor(private canvas: HTMLCanvasElement, private brightnessElement: HTMLElement,
                private radioButtonElements: any, private param1Element: HTMLElement) {

        canvas.width = this.canvas_size;
        canvas.height = this.canvas_size;

        const gl = initGL(canvas);

        const shaders = new Shaders(gl, canvas, this.points_size);
        const buffers = new Buffers(gl, shaders, this.points_size);
        const textures = new Textures(gl, this.points_size, this.grid_size);
        const framebuffers = new Framebuffers(gl, textures);
        this.ctx = new FlameRenderContext(gl, shaders, buffers, textures, framebuffers)
        this.settings = new FlameRenderSettings(1.2, this.canvas_size, this.points_size, 1, 0.0)
        this.display = new FlameRendererDisplay(this.ctx, this.settings)
        this.iterator = new FlameIterator(this.ctx, this.settings)
    }

    private getRadioValue() {
        for (var i = 0; i < this.radioButtonElements.length; i++) {
            var radioButtonElement = this.radioButtonElements[i];

            if (radioButtonElement.checked)
                return radioButtonElement.value;
        }
    }

    public drawScene() {
        this.settings.frames = this.frames;
        // @ts-ignore
        this.settings.brightness = this.brightnessElement.value;


        this.settings.time += 0.01;
        //
        this.iterator.iterateIFS();

        //
        if (this.frames > 20) {
            this.iterator.plotHistogram();
        }

        //
        var displayMode = this.getRadioValue();

        switch (displayMode) {
            case "flame":
                this.display.displayFlame();
                break;
            case "position":
                this.display.displayPosition();
                break;
            case "colour":
                this.display.displayColour();
                break;
        }

        this.frames++;

        if (this.frames < 2500)
            window.requestAnimationFrame(this.drawScene.bind(this));
    }



}