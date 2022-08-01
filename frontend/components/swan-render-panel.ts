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

import {html, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-combo-box';
import '@vaadin/scroller';
import '../components/swan-progress-indicator'
import {MobxLitElement} from "@adobe/lit-mobx";
import {FlameRenderer} from "Frontend/flames/renderer/flame-renderer";
import {getTimeStamp} from "Frontend/components/utils";
import {AppInfoEndpoint} from "Frontend/generated/endpoints";
import {renderInfoStore} from "Frontend/stores/render-info-store";
import {SharedRenderContext} from "Frontend/flames/renderer/shared-render-context";
import {editorStore} from "Frontend/stores/editor-store";

@customElement('swan-render-panel')
export class SwanRenderPanel extends MobxLitElement {
  @property()
  containerWidth = '30em'

  @property()
  containerHeight = '30em'

  @property()
  canvasDisplayWidth = '24em'

  @property()
  canvasDisplayHeight = '24em'

  @property({type: Boolean})
  withProgressBar = true

  @property()
  sharedRenderCtx: SharedRenderContext | undefined = undefined

  canvas!: HTMLCanvasElement
  canvasContainer!: HTMLDivElement

  lastProgressUpdate = 0.0

  onCreateFlameRenderer?: ()=>FlameRenderer

  onRenderFinished?: (frameCount: number, elapsedTimeInS: number) => void
  onAfterRenderFinishedOnce?: () => void | undefined = undefined

  renderer: FlameRenderer | undefined = undefined

  render() {
    return html `         
        <vaadin-scroller style="max-width: ${this.containerWidth}; max-height: ${this.containerHeight};" id="canvas-container">
            <canvas width="64" height="64"></canvas>
        </vaadin-scroller>
    `
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.canvasContainer = this.shadowRoot!.querySelector('#canvas-container')!
  }

  hasCanvas = ()=> {
    return this.canvasContainer && this.canvasContainer.querySelector('canvas')
  }

  recreateCanvas = ()=> {
    this.canvasContainer.innerHTML = '';
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'screen'
    this.canvas.style.width = this.canvasDisplayWidth
    this.canvas.style.height = this.canvasDisplayHeight
    this.canvas.width = 512
    this.canvas.height = 512
    this.canvasContainer.appendChild(this.canvas)
  }

  cancelRender = ()=> {
    if(this.renderer) {
      this.renderer.signalCancel(undefined)
    }
  }

  public rerenderFlame = (renderer: FlameRenderer | undefined = undefined)=> {
    if(this.renderer) {
      const reuseCanvas = this.hasCanvas()
      const that = this
      this.renderer.signalCancel(()=>{
        if(!reuseCanvas) {
          that.renderer!.closeBuffers()
          that.recreateCanvas()
        }
        that.renderFlame(renderer)
      })
    }
    else {
      this.recreateCanvas()
      this.renderFlame(renderer)
    }
  }

  public fluidReRenderFlame = (renderer: FlameRenderer | undefined = undefined,paramId: number, refValue: number, newValue: number) => {
    if(this.renderer) {
      const reuseCanvas = this.hasCanvas()
      const that = this
      const wasFinished = this.renderer.changeParameter(paramId, refValue, newValue)
      if(wasFinished) {
        this.renderFlame(renderer)
      }
    }
    else {
      this.recreateCanvas()
      this.renderFlame(renderer)
    }
  }

  disconnectedCallback() {
    if(this.renderer) {
      this.renderer.signalCancel(undefined)
      this.renderer = undefined
    }
    super.disconnectedCallback()
  }

  renderFlame =(renderer: FlameRenderer | undefined = undefined) => {
    try {
      if (!this.hasCanvas()) {
        console.log("NO CANVAS - creating one!")
        this.recreateCanvas()
      }
      renderInfoStore.renderProgress = 0.0
      renderInfoStore.renderInfo = 'Rendering'
      if (renderer) {
        this.renderer = renderer
      } else {
        this.renderer = this.onCreateFlameRenderer!();
        this.renderer.onRenderFinished = this.execOnRenderFinished
        this.renderer.onRenderCancelled = this.onRenderCancelled
        this.renderer.onUpdateRenderProgress = this.onUpdateRenderProgress
      }
      this.lastProgressUpdate = getTimeStamp()
      this.renderer.drawScene()
    }
    catch(e) {
      console.log('ERROR WHILE RENDERING:', e)
      if(this.sharedRenderCtx) {
        console.log('Flame:', this.sharedRenderCtx.currFlame)
        console.log('RenderFlame:', this.sharedRenderCtx.currRenderFlame)
        console.log('CompPointsFragmentShader:', this.sharedRenderCtx.currCompPointsFragmentShader)
        console.log('currProgPointsVertexShader:', this.sharedRenderCtx.currProgPointsVertexShader)
      }
      else {
        console.log('Connect the render-panel with a shared render context to gather diagnostic information')
      }
      throw e
    }
  }

  execOnRenderFinished = (frameCount: number, elapsedTimeInS: number) => {
    if(!(this.renderer && this.renderer.fastPreview)) {
      renderInfoStore.renderProgress = 1.0
      renderInfoStore.renderInfo = 'Rendering finished after ' + Math.round((elapsedTimeInS + Number.EPSILON) * 100) / 100 + ' s'
      AppInfoEndpoint.incFlamesRendered()
      if (this.onRenderFinished) {
        this.onRenderFinished(frameCount, elapsedTimeInS)
      }
    }
    if(this.onAfterRenderFinishedOnce) {
      const cb = this.onAfterRenderFinishedOnce
      this.onAfterRenderFinishedOnce = undefined
      cb()
    }
  }

  onRenderCancelled = (frameCount: number, elapsedTimeInS: number) => {
    // nothing
  }

  onUpdateRenderProgress = (currSampleCount: number, maxSampleCount: number, frameCount: number, elapsedTimeInSeconds: number)=> {
    const currTimeStamp = getTimeStamp()
    if(currTimeStamp > this.lastProgressUpdate + 333) {
      renderInfoStore.renderProgress = currSampleCount / maxSampleCount
      renderInfoStore.renderInfo = `Rendering in progress ${Math.round(currSampleCount/maxSampleCount*100)}% (frame: ${frameCount})`
      this.lastProgressUpdate = currTimeStamp
    }
  }

  clearRenderer() {
    if(this.renderer) {
      this.renderer.signalCancel(undefined)
      this.renderer = undefined
    }
  }
}
