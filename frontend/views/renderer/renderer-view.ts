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

import {html, PropertyValues} from 'lit'
import {customElement, query} from 'lit/decorators.js'
import { View } from '../../views/view'
import './renderer-upload-panel';
import './renderer-render-panel';
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-combo-box'
import '@vaadin/vaadin-checkbox'
import '@vaadin/scroller'
import '@vaadin/vaadin-progress-bar'
import {RendererFlame, rendererStore} from "Frontend/stores/renderer-store";
import '../../components/render-panel'
import '../../components/swan-error-panel'
import {FlameRenderer} from "Frontend/flames/renderer/flame-renderer";
import {DisplayMode} from "Frontend/flames/renderer/render-settings";
import {RenderPanel} from "Frontend/components/render-panel";
import {autorun} from "mobx";
import {state} from "lit/decorators";
import {HasValue} from "@hilla/form";
import '../../components/swan-loading-indicator';

@customElement('renderer-view')
export class RendererView extends View  {
    @state()
    imageSize = 512

    imageSizes = [128, 256, 512, 1024, 2048]

    @state()
    swarmSize = 256

    swarmSizes = [8, 16, 32, 64, 128, 256, 512, 1024]

    @state()
    autoSave = true

    @query('#imageContainer')
    imageContainer!: HTMLDivElement

    @query('#allImageContainer')
    allImageContainer!: HTMLDivElement

    render() {
        return html`
            <vertical-layout theme="spacing">
              <swan-error-panel .errorMessage=${rendererStore.lastError}></swan-error-panel>
              <div class="gap-m grid list-none m-2 p-2" style="grid-template-columns: repeat(auto-fill, minmax(24em, 1fr));">
                  <div style="display: flex; flex-direction: column; padding: 1em;">
                      <renderer-upload-panel style="border-radius: var(--lumo-border-radius); border: 1px dashed gray;"></renderer-upload-panel>
                      <div style="margin-top: 0.5em; display: flex; flex-direction: column; padding: 1.0em; border-radius: var(--lumo-border-radius); border: 1px dashed gray;">
                         <div style="display: flex;"> 
                             <vaadin-combo-box style="max-width: 10em;" label="Image size" .items="${this.imageSizes}" value="${this.imageSize}"
                                @change="${(event: Event) => this.imageSizeChanged(event)}"></vaadin-combo-box>
                             <vaadin-combo-box style="max-width: 10em; margin-left: 1em;" label="Swarm size" .items="${this.swarmSizes}" value="${this.swarmSize}"
                               @change="${(event: Event) => this.pointsSizeChanged(event)}"></vaadin-combo-box>
                          </div>
                          <vaadin-checkbox ?checked=${this.autoSave} label="Automatic download generated files" @change="${(event: Event) => this.autoSaveChanged(event)}"></vaadin-checkbox>
                          <div style="display: flex;">
                             <vaadin-button @click="${this.renderFlames}">Render</vaadin-button>
                           <vaadin-button theme="tertiary" @click="${this.signalCancel}">Cancel</vaadin-button>
                          </div>    
                         <vaadin-progress-bar value="${rendererStore.renderProgress}"></vaadin-progress-bar>
                         <swan-loading-indicator .loading=${rendererStore.rendering} caption="${rendererStore.cancelSignalled ? 'Aborting...' : 'Rendering...'}"></swan-loading-indicator>
                       </div>
                  </div>
                   <div style="border-radius: var(--lumo-border-radius); border: 1px dashed gray; margin: 1.0em;">
                       <renderer-render-panel></renderer-render-panel>
                       <render-panel style="margin: 1em;" .withProgressBar="${false}" containerWidth="12.5em" containerHeight="12.5em"
                                     canvasDisplayWidth="12em" canvasDisplayHeight="12em" .onCreateFlameRenderer=${this.createFlameRenderer}></render-panel>

                   </div>
                  <div class="gap-m grid list-none m-2 p-2" style="grid-template-columns: repeat(auto-fill, minmax(7em, 1fr));" id="allImageContainer"></div>

            </vertical-layout>
            <div style="display: none;" id="imageContainer"></div>
        `;
    }

    private imageSizeChanged(event: Event) {
        if ((event.target as HasValue<string>).value) {
            this.imageSize = parseInt((event.target as HasValue<string>).value!)
        }
    }

    private pointsSizeChanged(event: Event) {
        if ((event.target as HasValue<string>).value) {
            this.swarmSize = parseInt((event.target as HasValue<string>).value!)
        }
    }

    private autoSaveChanged(event: Event) {
        if ((event.target as HasValue<string>).value) {
            this.autoSave = (event.target as any).checked ? true: false
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        const that = this
        autorun(() => {
            const sel = rendererStore.selectedFlames
            if(sel && sel.length>0 && !rendererStore.rendering) {
                that.getRenderPanel().rerenderFlame()
            }
        })
    }

    createFlameRenderer = ()=> {
        return new FlameRenderer(256, 256,
          DisplayMode.FLAME, this.getRenderPanel().canvas, undefined,
          false, rendererStore.selectedFlames[0].flame)
    }

    getRenderPanel = (): RenderPanel =>  {
        return document.querySelector('render-panel')!
    }

    renderFlames = () => {
      rendererStore.cancelSignalled = false
      rendererStore.rendering = true
      rendererStore.renderFlameTotalCount = rendererStore.flames.filter(flame=>!flame.finished).length
      this.renderNextFlame();
    }

    renderer?: FlameRenderer

    renderNextFlame = ()=> {
        const flame = rendererStore.flames.find(flame => !flame.finished)
        if(flame && !rendererStore.cancelSignalled) {
            const remaining = rendererStore.flames.filter(flame=>!flame.finished).length
            rendererStore.renderProgress = (rendererStore.renderFlameTotalCount - remaining) / rendererStore.renderFlameTotalCount
            const renderPanel = this.getRenderPanel()
            renderPanel.clearRenderer()
            this.getRenderPanel().recreateCanvas()
            this.renderer =  new FlameRenderer(this.imageSize, this.swarmSize,
              DisplayMode.FLAME, this.getRenderPanel().canvas, this.imageContainer,
              true, flame.flame)
            this.renderer.onRenderFinished=this.onFlameFinished.bind(this, flame)
            this.getRenderPanel().rerenderFlame(this.renderer)
        }
        else {
            rendererStore.rendering = false
            if(!rendererStore.cancelSignalled) {
                rendererStore.renderProgress = 1.0
            }
        }
    }

    private onFlameFinished = (flame: RendererFlame, frameCount: number, elapsedTimeInSeconds: number) => {
        const idx = rendererStore.flames.indexOf(flame)
        if(idx < 0) {
            console.log("RenderFlame not found - aborting")
        }
        else {
            rendererStore.updateFlameStatus(flame.uuid, true, elapsedTimeInSeconds)
            const img = this.imageContainer.querySelector("img")!
            const a = document.createElement('a')
            const linkText = flame.filename
            a.appendChild(img);
            a.title = flame.filename
            a.href = img.src
            a.download = flame.filename.substr(0, flame.filename.lastIndexOf(".")) + ".png";
            this.allImageContainer.appendChild(a)
            if(this.autoSave) {
                setTimeout(() => a.click(), 10)
            }
            this.renderNextFlame()
        }
    }

    signalCancel = () => {
        rendererStore.cancelSignalled = true
    }
}