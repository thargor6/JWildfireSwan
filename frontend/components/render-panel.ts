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
import {customElement, state} from 'lit/decorators.js';

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-combo-box';
import '@vaadin/scroller';
import '@vaadin/vaadin-progress-bar'
import {MobxLitElement} from "@adobe/lit-mobx";
import {FlameRenderer} from "Frontend/flames/renderer/flame-renderer";
import {getTimeStamp} from "Frontend/components/utils";
import {AppInfoEndpoint} from "Frontend/generated/endpoints";

@customElement('render-panel')
export class RenderPanel extends MobxLitElement {
  @state()
  renderInfo = ''

  @state()
  renderProgress = 0.0

  canvas!: HTMLCanvasElement
  canvasContainer!: HTMLDivElement

  lastProgressUpdate = 0.0

  onCreateFlameRenderer?: ()=>FlameRenderer

  renderer: FlameRenderer | undefined = undefined

  render() {
    return html `
            <div style="display: flex; flex-direction: column; align-items: center;">
                <vaadin-scroller style="max-width: 34em; max-height: 34em;" id="canvas-container">
                    <canvas style="width: 400px; height: 300px;" width="512" height="512"></canvas>
                </vaadin-scroller>
                <div style="display: flex; flex-direction: column;">
                    <div style="min-width: 26em;">${this.renderInfo}</div>
                    <vaadin-progress-bar .value=${this.renderProgress} theme="contrast"></vaadin-progress-bar>
                </div>
            </div>
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
    this.canvas.style.width = '28em'
    this.canvas.style.height = '28em'
    this.canvas.width = 512
    this.canvas.height = 512
    this.canvasContainer.appendChild(this.canvas)
  }

  cancelRender = ()=> {
    if(this.renderer) {
      this.renderer.signalCancel(undefined)
    }
  }

  rerenderFlame = ()=> {
    if(this.renderer) {
      const reuseCanvas = this.hasCanvas()
      const that = this
      this.renderer.signalCancel(()=>{
        that.renderer!.closeBuffers()
        if(!reuseCanvas) {
          this.recreateCanvas()
        }
        this.renderFlame()
      })
    }
    else {
      this.recreateCanvas()
      this.renderFlame()
    }
  }

  disconnectedCallback() {
    if(this.renderer) {
      this.renderer.signalCancel(undefined)
      this.renderer = undefined
    }
    super.disconnectedCallback()
  }

  renderFlame =() => {
    if(!this.hasCanvas()) {
      console.log("NO CANVAS!")
      this.recreateCanvas()
    }
    this.renderProgress = 0.0
    this.renderInfo = 'Rendering'
    this.renderer = this.onCreateFlameRenderer!();
    this.lastProgressUpdate = getTimeStamp()
    this.renderer.onRenderFinished = this.onRenderFinished
    this.renderer.onRenderCancelled = this.onRenderCancelled
    this.renderer.onUpdateRenderProgress = this.onUpdateRenderProgress
    this.renderer.drawScene()
  }

  onRenderFinished = (frameCount: number, elapsedTimeInS: number) => {
    this.renderProgress = 1.0
    this.renderInfo = 'Rendering finished after ' + Math.round((elapsedTimeInS + Number.EPSILON) * 100) / 100 + ' s'
    AppInfoEndpoint.incFlamesRendered()
  }

  onRenderCancelled = (frameCount: number, elapsedTimeInS: number) => {
    // nothing
  }

  onUpdateRenderProgress = (currSampleCount: number, maxSampleCount: number, frameCount: number, elapsedTimeInSeconds: number)=> {
    const currTimeStamp = getTimeStamp()
    if(currTimeStamp > this.lastProgressUpdate + 333) {
      this.renderProgress = currSampleCount / maxSampleCount
      this.renderInfo = `Rendering in progress ${Math.round(currSampleCount/maxSampleCount*100)}% (frame: ${frameCount})`
      this.lastProgressUpdate = currTimeStamp
    }
  }


}
