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

type RenderFinishedHandler = (frameCount: number, elapsedTimeInMs: number) => void
type RenderProgressHandler = (currSampleCount: number, maxSampleCount: number, frameCount: number, elapsedTimeInMs: number) => void

export class FlameRenderer {
    currFrameCount = 0
    ctx: FlameRenderContext
    settings: FlameRenderSettings
    iterator: FlameIterator
    display: FlameRendererDisplay
    saveNextImage = false
    maxSampleCount: number
    currSampleCount: number
    samplesPerFrame: number
    saveImageontainer: HTMLDivElement | undefined = undefined
    imageSourceCanvas: HTMLCanvasElement | undefined = undefined
    startTimeStampInMs: number
    currTimeStampInMs: number
    onRenderFinished: RenderFinishedHandler = (frameCount: number, elapsedTimeInSeconds: number) => {}
    onUpdateRenderProgress: RenderProgressHandler = (currSampleCount: number, maxSampleCount: number, frameCount: number, elapsedTimeInSeconds: number) => {}

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

        this.maxSampleCount = imageWidth * imageHeight * flame.sampleDensity.value
        this.samplesPerFrame = swarm_size * swarm_size * 0.5
        this.currSampleCount = 0

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

        this.startTimeStampInMs = this.getTimeStamp()
        this.currTimeStampInMs = this.startTimeStampInMs
    }

    getTimeStamp() {
      // @ts-ignore
      return window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now()
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
        this.settings.frames = this.currFrameCount;
        // @ts-ignore
        this.settings.brightness = this.brightnessElement.value;


        this.settings.time += 0.01;
        //
        this.iterator.iterateIFS();

        //
        if (this.currFrameCount > 8) {
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

        this.currFrameCount++;



        if(this.currFrameCount>5) {
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

        this.currSampleCount += this.samplesPerFrame
        this.currTimeStampInMs = this.getTimeStamp()
        const elapsedTimeInSeconds = (this.currTimeStampInMs-this.startTimeStampInMs)/1000
        if (this.currSampleCount < this.maxSampleCount) {
            this.onUpdateRenderProgress(this.currSampleCount, this.maxSampleCount, this.currFrameCount, elapsedTimeInSeconds)
            window.requestAnimationFrame(this.drawScene.bind(this));
        }
        else {
            this.onRenderFinished(this.currFrameCount, elapsedTimeInSeconds)
        }
    }

    saveCurrentImageToContainer(canvas: HTMLCanvasElement, destContainer: HTMLDivElement) {
        this.saveImageontainer = destContainer
        this.imageSourceCanvas = canvas
        this.saveNextImage = true
    }
}