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
import '@vaadin/app-layout/vaadin-drawer-toggle';
import {BatchRendererFlame, batchRendererStore} from "Frontend/stores/batch-renderer-store";
import '../../components/swan-render-panel'
import '../../components/swan-error-panel'
import {FlameRenderer} from "Frontend/flames/renderer/flame-renderer";
import {DisplayMode} from "Frontend/flames/renderer/render-settings";
import {SwanRenderPanel} from "Frontend/components/swan-render-panel";
import {autorun} from "mobx";
import {state} from "lit/decorators";
import {HasValue} from "@hilla/form";
import '../../components/swan-loading-indicator';
import {RenderResolutions} from "Frontend/flames/renderer/render-resolution";
import {Parameters} from "Frontend/flames/model/parameters";
import {msg, localized} from "@lit/localize";

@localized()
@customElement('batch-renderer-view')
export class BatchRendererView extends View  {
    @state()
    renderSize = RenderResolutions.defaultRenderSize

    renderSizes = RenderResolutions.renderSizes

    @state()
    swarmSize = RenderResolutions.defaultSwarmSize

    swarmSizes = RenderResolutions.swarmSizes

    @state()
    cropSize = RenderResolutions.defaultRenderResolution

    cropSizes = RenderResolutions.getRenderResolutions(this.renderSize)

    @state()
    qualityScale = RenderResolutions.defaultQualityScale

    qualityScaleValues = RenderResolutions.qualityScales

    @state()
    autoSave = true

    @state()
    disableTransparency = false

    @query('#imageContainer')
    imageContainer!: HTMLDivElement

    @query('#allImageContainer')
    allImageContainer!: HTMLDivElement

    render() {
        return html`
            <header class="bg-base border-b border-contrast-10 box-border flex h-xl items-center w-full" slot="navbar">
                <vaadin-drawer-toggle aria-label="Menu toggle" class="text-secondary" theme="contrast"></vaadin-drawer-toggle>
                <h1 class="m-0 text-l">${msg('Batch flame renderer')}</h1>
            </header>
            <vertical-layout theme="spacing">
              <swan-error-panel .errorMessage=${batchRendererStore.lastError}></swan-error-panel>
              <div class="gap-m grid list-none m-2 p-2" style="grid-template-columns: repeat(auto-fill, minmax(24em, 1fr));">
                  <div style="display: flex; flex-direction: column; padding: 1em;">
                      <renderer-upload-panel style="border-radius: var(--lumo-border-radius); border: 1px dashed gray;"></renderer-upload-panel>
                      <div style="margin-top: 0.5em; display: flex; flex-direction: column; padding: 1.0em; border-radius: var(--lumo-border-radius); border: 1px dashed gray;">
                         <div style="display: flex;"> 
                             <vaadin-combo-box style="max-width: 10em;" label="Render size" .items="${this.renderSizes}" value="${this.renderSize}"
                                               @change="${(event: Event) => this.renderSizeChanged(event)}"></vaadin-combo-box>
                             <vaadin-combo-box style="max-width: 10em; margin-left: 1em;" label="Crop size"
                                               .items="${this.cropSizes!.map(cropSize => cropSize.displayName)}" value="${this.cropSize.displayName}"
                                               @change="${(event: Event) => this.cropSizeChanged(event)}"></vaadin-combo-box>
                          </div>
                          <div style="display: flex;">
                            <vaadin-combo-box style="max-width: 10em;" label="Swarm size" .items="${this.swarmSizes}" value="${this.swarmSize}"
                                            @change="${(event: Event) => this.pointsSizeChanged(event)}"></vaadin-combo-box>
                              <vaadin-combo-box style="max-width: 10em; margin-left: 1em;" label="Quality scale"
                                                .items="${this.qualityScaleValues}" value="${this.qualityScale}"
                                                @change="${(event: Event) => this.qualityScaleChanged(event)}"></vaadin-combo-box>

                          </div>
                          <vaadin-checkbox style="margin-top: 1em;" ?checked=${this.autoSave} label="Automatic download generated files" @change="${(event: Event) => this.autoSaveChanged(event)}"></vaadin-checkbox>
                          <vaadin-checkbox style="margin-top: 1em;" ?checked=${this.disableTransparency} label="Disable transparency" @change="${(event: Event) => this.disableTransparencyChanged(event)}"></vaadin-checkbox>

                           <div style="display: flex; margin-top: 1em; margin-bottom: 1em;">
                             <vaadin-button @click="${this.renderFlames}">Render</vaadin-button>
                             <vaadin-button theme="tertiary" @click="${this.signalCancel}">Cancel</vaadin-button>
                          </div>    
                         <vaadin-progress-bar value="${batchRendererStore.renderProgress}"></vaadin-progress-bar>
                         <swan-loading-indicator .loading=${batchRendererStore.rendering} caption="${batchRendererStore.cancelSignalled ? 'Aborting...' : 'Rendering...'}"></swan-loading-indicator>
                       </div>
                  </div>
                   <div style="border-radius: var(--lumo-border-radius); border: 1px dashed gray; margin: 1.0em;">
                       <renderer-render-panel></renderer-render-panel>
                       <swan-render-panel style="margin: 1em;" .withProgressBar="${false}" containerWidth="12.5em" containerHeight="12.5em"
                                     canvasDisplayWidth="12em" canvasDisplayHeight="12em" .onCreateFlameRenderer=${this.createFlameRenderer}></swan-render-panel>
                   </div>
                  <div class="gap-m grid list-none m-2 p-2" style="grid-template-columns: repeat(auto-fill, minmax(7em, 1fr));" id="allImageContainer"></div>

            </vertical-layout>
            <div style="display: none;" id="imageContainer"></div>
        `;
    }

    private renderSizeChanged(event: Event) {
        if ((event.target as HasValue<string>).value) {
            this.renderSize = parseInt((event.target as HasValue<string>).value!)
            this.cropSizes = RenderResolutions.getRenderResolutions(this.renderSize)
            this.cropSize = this.cropSizes![0]
        }
    }

    private qualityScaleChanged(event: Event) {
        if ((event.target as HasValue<string>).value) {
            this.qualityScale = parseFloat((event.target as HasValue<string>).value!)
        }
    }

    private cropSizeChanged(event: Event) {
        if ((event.target as HasValue<string>).value) {
            this.cropSize = RenderResolutions.findRenderResolutionByName(this.renderSize, (event.target as HasValue<string>).value!)
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

    private disableTransparencyChanged(event: Event) {
        if ((event.target as HasValue<string>).value) {
            this.disableTransparency = (event.target as any).checked ? true: false
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        const that = this
        autorun(() => {
            const sel = batchRendererStore.selectedFlames
            if(sel && sel.length>0 && !batchRendererStore.rendering) {
                that.getRenderPanel().rerenderFlame()
            }
        })
    }

    createFlameRenderer = ()=> {
      return new FlameRenderer(batchRendererStore.sharedRenderCtx, 256, 256,
        DisplayMode.FLAME, this.getRenderPanel().canvas, undefined,
          false, '', undefined, 1.0,
          false, batchRendererStore.selectedFlames[0].flame)
    }

    getRenderPanel = (): SwanRenderPanel =>  {
        return document.querySelector('swan-render-panel')!
    }

    renderFlames = () => {
      batchRendererStore.cancelSignalled = false
      batchRendererStore.rendering = true
      batchRendererStore.renderFlameTotalCount = batchRendererStore.flames.filter(flame=>!flame.finished).length
      this.renderNextFlame();
    }

    renderer?: FlameRenderer

    MAX_IMAGES_HOLD = 4

    renderNextFlame = ()=> {
        const flame = batchRendererStore.flames.find(flame => !flame.finished)
        if(flame && !batchRendererStore.cancelSignalled) {
            if(this.disableTransparency) {
                flame.flame.bgTransparency = Parameters.booleanParam(false)
            }
            if(this.autoSave) {
              while(this.allImageContainer.children.length>this.MAX_IMAGES_HOLD) {
                  this.allImageContainer.removeChild(this.allImageContainer.children[0])
              }
            }
            const remaining = batchRendererStore.flames.filter(flame=>!flame.finished).length
            batchRendererStore.renderProgress = (batchRendererStore.renderFlameTotalCount - remaining) / batchRendererStore.renderFlameTotalCount
            const renderPanel = this.getRenderPanel()
            renderPanel.clearRenderer()
            this.getRenderPanel().recreateCanvas()
            this.renderer = new FlameRenderer(batchRendererStore.sharedRenderCtx, this.renderSize, this.swarmSize,
              DisplayMode.FLAME, this.getRenderPanel().canvas, this.imageContainer,
              true, '',
              // TODO: renderPath
              RenderResolutions.getCropRegion(this.renderSize, this.cropSize),
              this.qualityScale, false, flame.flame)
            this.renderer.onRenderFinished=this.onFlameFinished.bind(this, flame)
            this.getRenderPanel().rerenderFlame(this.renderer)
        }
        else {
            batchRendererStore.rendering = false
            if(!batchRendererStore.cancelSignalled) {
                batchRendererStore.renderProgress = 1.0
            }
        }
    }

    private onFlameFinished = (flame: BatchRendererFlame, frameCount: number, elapsedTimeInSeconds: number) => {
        const idx = batchRendererStore.flames.indexOf(flame)
        if(idx < 0) {
            console.log("RenderFlame not found - aborting")
        }
        else {
            batchRendererStore.updateFlameStatus(flame.uuid, true, elapsedTimeInSeconds)
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
        batchRendererStore.cancelSignalled = true
    }
}