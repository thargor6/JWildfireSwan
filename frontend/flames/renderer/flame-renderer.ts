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
import {DisplayMode, FlameRenderSettings} from "./render-settings";
import {FlameRendererDisplay} from "./display";
import {FlameIterator} from "./iterator";
import {Flame, GRADIENT_SIZE} from "Frontend/flames/model/flame";
import {FlameMapper} from "Frontend/flames/model/mapper/flame-mapper";
import {RenderColor, RenderFlame} from "Frontend/flames/model/render-flame";

type RenderFinishedHandler = (frameCount: number, elapsedTimeInMs: number) => void
type RenderProgressHandler = (currSampleCount: number, maxSampleCount: number, frameCount: number, elapsedTimeInMs: number) => void

export class FlameRenderer {
    currFrameCount = 0
    ctx: FlameRenderContext
    settings: FlameRenderSettings
    iterator: FlameIterator
    display: FlameRendererDisplay
    maxSampleCount: number
    currSampleCount: number
    samplesPerFrame: number
    saveImageontainer: HTMLDivElement | undefined = undefined
    imageSourceCanvas: HTMLCanvasElement | undefined = undefined
    startTimeStampInMs: number
    currTimeStampInMs: number
    cancelSignalled = false
    onRenderFinished: RenderFinishedHandler = (frameCount: number, elapsedTimeInSeconds: number) => {}
    onRenderCancelled: RenderFinishedHandler = (frameCount: number, elapsedTimeInSeconds: number) => {}
    onUpdateRenderProgress: RenderProgressHandler = (currSampleCount: number, maxSampleCount: number, frameCount: number, elapsedTimeInSeconds: number) => {}

    constructor(private canvas_size: number,
                private swarm_size: number,
                private displayMode: DisplayMode,
                private canvas: HTMLCanvasElement,
                private imgCaptureContainer: HTMLDivElement,
                private autoCaptureImage: boolean,
                private flame: Flame) {

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
        this.settings = new FlameRenderSettings(1.2, this.canvas_size, this.swarm_size, 1, 0.0, displayMode)
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

    public drawScene() {
        this.settings.frames = this.currFrameCount;
        this.settings.brightness = 1.0 // this.brightnessElement.value;
        this.settings.time += 0.01;
        //
        this.iterator.iterateIFS();
        //
        if (this.currFrameCount > 1) {
            this.iterator.plotHistogram();
        }

        //
        switch(this.settings.displayMode) {
            case DisplayMode.POSITION_ITER:
                this.display.displayPositionIteration();
                break;
            case DisplayMode.COLOR_ITER:
                this.display.displayColorIteration();
                break;
            case DisplayMode.GRADIENT:
                this.display.displayGradient();
                break;
            case DisplayMode.FLAME:
            default:
                this.display.displayFlame();
        }
        this.currFrameCount++;

        if(this.currFrameCount>5) {
         // this.frames=0;
       //   this.ctx.textures.clearHistogram();
        }

        this.currSampleCount += this.samplesPerFrame
        this.currTimeStampInMs = this.getTimeStamp()
        const elapsedTimeInSeconds = (this.currTimeStampInMs-this.startTimeStampInMs)/1000
        if(this.cancelSignalled) {
            this.onRenderCancelled(this.currFrameCount, elapsedTimeInSeconds)
        }
        else {
            if (this.currSampleCount < this.maxSampleCount) {
                this.onUpdateRenderProgress(this.currSampleCount, this.maxSampleCount, this.currFrameCount, elapsedTimeInSeconds)
                window.requestAnimationFrame(this.drawScene.bind(this));
            }
            else {

                if(this.autoCaptureImage && this.imgCaptureContainer) {
                    const imgData =  this.canvas.toDataURL("image/jpg")
                    const imgElement = document.createElement('img')
                    imgElement.src = imgData;
                    this.imgCaptureContainer.innerHTML = ''
                    this.imgCaptureContainer.appendChild(imgElement)
                }
                this.onRenderFinished(this.currFrameCount, elapsedTimeInSeconds)
            }
        }
    }

    public signalCancel() {
        this.cancelSignalled = true
    }

}