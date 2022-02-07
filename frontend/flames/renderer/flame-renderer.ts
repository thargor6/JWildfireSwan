/*
  JWildfire Swan - fractal flames the playful way, GPU accelerated
  Copyright (C) 2021-2022 Andreas Maschke

  This is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
  General Public License as published by the Free Software Foundation; either version 2.1 of the
  License, or (at your option) any later version.

  This software is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
  even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License along with this software;
  if not, write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
  02110-1301 USA, or see the FSF site: http://www.fsf.org.
*/

import {initGL} from './shadergen/webgl-shader-utils'
import {WebglShaders} from './shadergen/webgl-shaders'
import {Buffers} from "./buffers";
import {Textures} from './textures'
import {Framebuffers} from './framebuffers'
import {FlameRenderContext} from "./render-context";
import {FlameRenderSettings} from "./render-settings";
import {FlameRendererDisplay} from "./display";
import {FlameIterator} from "./iterator";
import {Flame, GRADIENT_SIZE} from "Frontend/flames/model/flame";
import {FlameMapper} from "Frontend/flames/model/mapper/flame-mapper";
import {RenderColor, RenderFlame} from "Frontend/flames/model/render-flame";
import {render} from "lit";

export class FlameRenderer {
    frames = 0
    ctx: FlameRenderContext
    settings: FlameRenderSettings
    iterator: FlameIterator
    display: FlameRendererDisplay
    saveNextImage = false
    saveImageontainer: HTMLDivElement | undefined = undefined
    imageSourceCanvas: HTMLCanvasElement | undefined = undefined


    constructor(private canvas_size: number,
                private swarm_size: number,
                private canvas: HTMLCanvasElement,
                private flame: Flame,
                private brightnessElement: HTMLElement,
                private radioButtonElements: any, private param1Element: HTMLElement) {

        const renderFlame = FlameMapper.mapForRendering(flame)
        this.prepareFlame(renderFlame)
        const imageWidth = canvas_size
        const imageHeight = canvas_size
        const wScl = imageWidth / renderFlame.width
        const hScl = imageHeight / renderFlame.height
        renderFlame.pixelsPerUnit = (wScl + hScl) * 0.5 * renderFlame.pixelsPerUnit
        renderFlame.width = imageWidth
        renderFlame.height = imageHeight

        canvas.width = this.canvas_size
        canvas.height = this.canvas_size

        const gl = initGL(canvas)

        const shaders = new WebglShaders(gl, canvas, this.canvas_size, this.swarm_size, renderFlame)
        const buffers = new Buffers(gl, shaders, this.swarm_size)
        const textures = new Textures(renderFlame, gl, this.swarm_size, this.canvas_size)
        const framebuffers = new Framebuffers(gl, textures)
        this.ctx = new FlameRenderContext(gl, shaders, buffers, textures, framebuffers)
        this.settings = new FlameRenderSettings(1.2, this.canvas_size, this.swarm_size, 1, 0.0)
        this.display = new FlameRendererDisplay(this.ctx, this.settings)
        this.iterator = new FlameIterator(this.ctx, this.settings)
    }

    private prepareFlame(renderFlame: RenderFlame) {
       renderFlame.xforms.forEach(xform => {
           xform.c1 = (1.0 + xform.colorSymmetry) * 0.5;
           xform.c2 = xform.color * (1 - xform.colorSymmetry) * 0.5;
       })
       while(renderFlame.gradient.length<GRADIENT_SIZE) {
           renderFlame.gradient.push(new RenderColor(0, 0, 0))
       }
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
        if (this.frames > 8) {
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
            default:
                this.display.displayFlame();
        }

        this.frames++;


        if(this.frames>5) {
         // this.frames=0;
       //   this.ctx.textures.clearHistogram();
        }

        if(this.saveNextImage) {
            this.saveNextImage = false
            if(this.saveImageontainer && this.imageSourceCanvas) {
                const imgData =  this.imageSourceCanvas.toDataURL("image/png");
                const imgElement = document.createElement('img');
                imgElement.src = imgData;
                this.saveImageontainer.appendChild(imgElement);
                this.saveImageontainer = undefined
            }
        }

        if (this.frames < 3000)
            window.requestAnimationFrame(this.drawScene.bind(this));
    }


    saveCurrentImageToContainer(canvas: HTMLCanvasElement, destContainer: HTMLDivElement) {
        this.saveImageontainer = destContainer
        this.imageSourceCanvas = canvas
        this.saveNextImage = true
    }
}