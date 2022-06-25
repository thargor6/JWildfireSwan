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

import {CloseableBuffers, initGL} from './shadergen/webgl-shader-utils'
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
import {RenderColor, RenderMappingContext, RenderFlame} from "Frontend/flames/model/render-flame";
import {getTimeStamp} from "Frontend/components/utils";
import {CropRegion} from "Frontend/flames/renderer/render-resolution";
import {appStore} from "Frontend/stores/app-store";

type RenderFinishedHandler = (frameCount: number, elapsedTimeInMs: number) => void
type RenderProgressHandler = (currSampleCount: number, maxSampleCount: number, frameCount: number, elapsedTimeInMs: number) => void

export type OnRenderCancelledCallback = ()=>void

export class FlameRenderer implements CloseableBuffers {
    currFrameCount = 0
    ctx: FlameRenderContext
    settings: FlameRenderSettings
    iterator: FlameIterator
    display: FlameRendererDisplay
    initialMaxSampleCount: number
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

    shaders: WebglShaders | null
    buffers: Buffers | null
    framebuffers: Framebuffers | null
    textures: Textures | null

    onRenderCancelledCallback: OnRenderCancelledCallback | undefined = undefined
    isFinished = true

    constructor(private canvas_size: number,
                private swarm_size: number,
                private displayMode: DisplayMode,
                private canvas: HTMLCanvasElement,
                private imgCaptureContainer: HTMLDivElement | undefined,
                private autoCaptureImage: boolean,
                private imgOutputFilename: string,
                private cropRegion: CropRegion | undefined,
                private qualityScale: number,
                private flame: Flame) {
        const renderMappingCtx = new RenderMappingContext(flame.frame.value, flame.motionBlurLength.value, flame.motionBlurTimeStep.value)
        const renderFlame = FlameMapper.mapForRendering(renderMappingCtx, flame)
        this.prepareFlame(renderFlame)
        const imageWidth = canvas_size
        const imageHeight = canvas_size
        const wScl = imageWidth / renderFlame.width
        const hScl = imageHeight / renderFlame.height
        renderFlame.pixelsPerUnit = (wScl + hScl) * 0.5 * renderFlame.pixelsPerUnit
        renderFlame.width = imageWidth
        renderFlame.height = imageHeight

        this.maxSampleCount = imageWidth * imageHeight * flame.sampleDensity.value * 1.5 * this.qualityScale
        this.initialMaxSampleCount = this.maxSampleCount

        this.samplesPerFrame = swarm_size * swarm_size
        this.currSampleCount = 0

        canvas.width = this.canvas_size
        canvas.height = this.canvas_size

        const gl = initGL(canvas)

        this.shaders = new WebglShaders(gl, canvas, this.canvas_size, this.swarm_size, renderFlame)
        this.buffers = new Buffers(gl, this.shaders, this.swarm_size, renderFlame)
        this.textures = new Textures(gl, this.swarm_size, this.canvas_size, renderFlame)
        this.framebuffers = new Framebuffers(gl, this.textures, renderFlame)
        this.ctx = new FlameRenderContext(gl, this.shaders, this.buffers, this.textures, this.framebuffers)
        this.settings = new FlameRenderSettings(1.2, this.canvas_size, this.swarm_size, cropRegion,
          1, 0.0, displayMode)
        this.display = new FlameRendererDisplay(this.ctx, this.settings, renderFlame)
        this.iterator = new FlameIterator(this.ctx, this.settings, renderFlame)

        this.startTimeStampInMs = getTimeStamp()
        this.currTimeStampInMs = this.startTimeStampInMs
    }

    closeBuffers() {
        if(this.framebuffers) {
            this.framebuffers.closeBuffers()
            this.framebuffers = null
        }
        if(this.textures) {
            this.textures.closeBuffers()
            this.textures = null
        }
        if(this.buffers) {
            this.buffers.closeBuffers()
            this.buffers = null
        }
        if(this.shaders) {
            this.shaders.closeBuffers()
            this.shaders = null
        }
    }

    private prepareFlame(renderFlame: RenderFlame) {
       renderFlame.layers.forEach(layer=> {
         layer.xforms.forEach(xform => {
           xform.c1 = (1.0 + xform.colorSymmetry) * 0.5;
           xform.c2 = xform.color * (1 - xform.colorSymmetry) * 0.5;
         })
         while(layer.gradient.length<GRADIENT_SIZE) {
           layer.gradient.push(new RenderColor(0, 0, 0))
         }
       })
    }

    public drawScene() {
        this.isFinished = false
        this.settings.frames = this.currFrameCount;
        // TODO remove
        this.settings.brightness = 1.0 // this.brightnessElement.value;
        this.settings.time += 0.01;

        const iterationsPerFrame = 7

        //
        for(let iter=0;iter<iterationsPerFrame; iter++) {
            this.iterator.iterateIFS();
            this.currSampleCount += this.samplesPerFrame
            const finishedPct = this.currSampleCount / this.maxSampleCount * 100.0
            if ( finishedPct > 1.25) {
                this.iterator.plotHistogram();
            }
        }
        this.currFrameCount++
        //



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
            case DisplayMode.MOTION_BLUR_TIME:
                this.display.displayMotionBlurTime();
                break;
            case DisplayMode.FLAME:
            default:
                this.display.displayFlame();
        }

        this.currTimeStampInMs = getTimeStamp()
        const elapsedTimeInSeconds = (this.currTimeStampInMs-this.startTimeStampInMs) / 1000
        if(this.cancelSignalled) {
            this.onRenderCancelled(this.currFrameCount, elapsedTimeInSeconds)
            this.isFinished = true
            if(this.onRenderCancelledCallback) {
                const cb = this.onRenderCancelledCallback
                this.onRenderCancelledCallback = undefined
                cb()
            }
        }
        else {
            if (this.currSampleCount < this.maxSampleCount) {
                this.onUpdateRenderProgress(this.currSampleCount, this.maxSampleCount, this.currFrameCount, elapsedTimeInSeconds)
                window.requestAnimationFrame(this.drawScene.bind(this));
            }
            else {
                if(this.autoCaptureImage && this.imgCaptureContainer) {
                    if(this.cropRegion) {
                        const gl = this.canvas.getContext("webgl")!
                        const croppedWidth = this.cropRegion.width
                        const croppedHeight = this.cropRegion.height
                        const offsetX = this.cropRegion.x
                        const offsetY = this.cropRegion.y
                        let pixels = new Uint8Array(croppedWidth * croppedHeight * 4)
                        gl.readPixels(offsetX, offsetY, croppedWidth, croppedHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

                        const canvas = document.createElement('canvas')
                        canvas.width = croppedWidth
                        canvas.height = croppedHeight
                        const ctx = canvas.getContext('2d')!
                        // copy the pixels to a 2D canvas
                        const imageData = ctx.createImageData(croppedWidth, croppedHeight)
                        // flip the data at the y-axis
                        // https://stackoverflow.com/questions/67811153/webgl-readpixels-returns-flipped-y-axis
                        {
                            const length = croppedWidth * croppedHeight * 4
                            const row = croppedWidth * 4
                            const end = (croppedHeight - 1) * row
                            const flipped = new Uint8Array(length);
                            for (let i = 0; i < length; i += row) {
                                flipped.set(pixels.subarray(i, i + row), end - i)
                            }
                            pixels = flipped
                        }
                        imageData.data.set(pixels)
                        ctx.putImageData(imageData, 0, 0);
                        const imgElement: HTMLImageElement = document.createElement('img')
                        imgElement.src = canvas.toDataURL();
                        imgElement.width = 128
                        this.imgCaptureContainer.innerHTML = ''
                        this.imgCaptureContainer.appendChild(imgElement)
                        const divElement = document.createElement('div')
                        divElement.innerText = `Cropped resolution: ${croppedWidth}x${croppedHeight}, render time: ${Math.round(elapsedTimeInSeconds*100)/100}  s`
                        this.imgCaptureContainer.appendChild(divElement)
                        if(this.imgOutputFilename && this.imgOutputFilename.length > 0) {
                            this.notifyImageRendered(imgElement, this.imgOutputFilename)
                        }
                    }
                    else {
                        const imgData =  this.canvas.toDataURL("image/jpg")
                        const imgElement: HTMLImageElement = document.createElement('img')
                        imgElement.src = imgData;
                        imgElement.width = 128
                        this.imgCaptureContainer.innerHTML = ''
                        this.imgCaptureContainer.appendChild(imgElement)

                        const divElement = document.createElement('div')
                        divElement.innerText = `Resolution: ${this.canvas.width}x${this.canvas.height}, render time: ${Math.round(elapsedTimeInSeconds*100)/100}  s`
                        this.imgCaptureContainer.appendChild(divElement)
                        if(this.imgOutputFilename && this.imgOutputFilename.length > 0) {
                            this.notifyImageRendered(imgElement, this.imgOutputFilename)
                        }
                    }
                }
                this.onRenderFinished(this.currFrameCount, elapsedTimeInSeconds)
                this.isFinished = true
              }
        }
    }

    private notifyImageRendered(imgElement: HTMLImageElement, imgOutputFilename: string) {
        if(appStore.hasElectron) {
            appStore.ipcRenderer.send('image:rendered', {
                src: imgElement.src,
                filename: imgOutputFilename}
            )
            console.log("sent image url", imgOutputFilename)
        }
    }

    public signalCancel(cb: OnRenderCancelledCallback | undefined) {
        if(!this.isFinished) {
            this.onRenderCancelledCallback = cb
        }
        else if(cb) {
            cb()
        }
        this.cancelSignalled = true
    }

    public changeParameter(paramId: number, refValue: number, currValue: number): boolean {
        this.iterator.changeParameter(paramId, refValue, currValue)
        const currMax = this.maxSampleCount
        this.maxSampleCount += this.initialMaxSampleCount
        this.currSampleCount = currMax
        return this.isFinished
    }

}