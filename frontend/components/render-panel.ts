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
import '@vaadin/vaadin-progress-bar'
import {MobxLitElement} from "@adobe/lit-mobx";
import {FlameRenderer} from "Frontend/flames/renderer/flame-renderer";
import {getTimeStamp} from "Frontend/components/utils";
import {AppInfoEndpoint} from "Frontend/generated/endpoints";
import {autorun} from "mobx";
import {rendererStore} from "Frontend/stores/renderer-store";

@customElement('render-panel')
export class RenderPanel extends MobxLitElement {
  @state()
  renderInfo = ''

  @state()
  renderProgress = 0.0

  @property()
  containerWidth = '34em'

  @property()
  containerHeight = '34em'

  @property()
  canvasDisplayWidth = '28em'

  @property()
  canvasDisplayHeight = '28em'

  @property({type: Boolean})
  withProgressBar = true

  canvas!: HTMLCanvasElement
  canvasContainer!: HTMLDivElement

  lastProgressUpdate = 0.0

  onCreateFlameRenderer?: ()=>FlameRenderer

  renderer: FlameRenderer | undefined = undefined

  render() {
    return html `
            <div style="display: flex; flex-direction: column; align-items: center;">
                <vaadin-scroller style="max-width: ${this.containerWidth}; max-height: ${this.containerHeight};" id="canvas-container">
                    <canvas  width="64" height="64"></canvas>
                </vaadin-scroller>
                <div style="display: flex; flex-direction: column; min-width: ${this.canvasDisplayWidth};">
                    <div style="${this.withProgressBar ? `display:block;`: `display:none;`}">${this.renderInfo}</div>
                    <vaadin-progress-bar style="${this.withProgressBar ? `display:block;`: `display:none;`}" .value=${this.renderProgress} theme="contrast"></vaadin-progress-bar>
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
        that.renderer!.closeBuffers()
        if(!reuseCanvas) {
          this.recreateCanvas()
        }
        this.renderFlame(renderer)
      })
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
    if(!this.hasCanvas()) {
      console.log("NO CANVAS - creating one!")
      this.recreateCanvas()
    }
    this.renderProgress = 0.0
    this.renderInfo = 'Rendering'
    if(renderer) {
      this.renderer = renderer
    }
    else {
      this.renderer = this.onCreateFlameRenderer!();
      this.renderer.onRenderFinished = this.onRenderFinished
      this.renderer.onRenderCancelled = this.onRenderCancelled
      this.renderer.onUpdateRenderProgress = this.onUpdateRenderProgress
    }
    this.lastProgressUpdate = getTimeStamp()
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


  clearRenderer() {
    if(this.renderer) {
      this.renderer.signalCancel(undefined)
      this.renderer = undefined
    }
  }
}
