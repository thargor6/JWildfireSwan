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

import {html, nothing, PropertyValues} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import { View } from '../../views/view';

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-text-field'
import '@vaadin/dialog';
import '@vaadin/horizontal-layout';
import '@vaadin/text-area';
import '@vaadin/text-field';
import '@vaadin/vertical-layout';
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/tabs';

import {FlameRenderer} from '../../flames/renderer/flame-renderer'
import {FlamesEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from '../../flames/model/mapper/flame-mapper'
import '@vaadin/vaadin-combo-box';
import './playground-render-panel'
import './playground-flame-panel'
import './playground-variations-panel'
import '@vaadin/split-layout';

import {PlaygroundRenderPanel} from "Frontend/views/playground/playground-render-panel";
import {playgroundStore} from "Frontend/stores/playground-store";
import {PlaygroundFlamePanel} from "Frontend/views/playground/playground-flame-panel";
import '../../components/swan-loading-indicator'
import '../../components/swan-error-panel'

@customElement('playground-view')
export class PlaygroundView extends View {
    canvas!: HTMLCanvasElement
    canvasContainer!: HTMLDivElement
    capturedImageContainer!: HTMLDivElement

    @state()
    selectedTab = 0

    viewOptsPanel!: PlaygroundRenderPanel
    flamePanel!: PlaygroundFlamePanel

    render() {
        return html`
            <swan-error-panel .errorMessage=${playgroundStore.lastError}></swan-error-panel>
            <vaadin-split-layout>
                 <div style="display: flex; align-items: center; justify-content: center;"
                     stylex="max-height: 70em;max-width:70em;overflow: scroll;" id="canvas-container">
                    <canvasx id="screen1" width="512" height="512"></canvasx>
                    
                </div>
                <div style="display: flex; flex-direction: column; padding: 1em;">

                    <div style="display: flex; flex-direction: row; align-items: flex-end; margin-right: 1em;">
                       </div>

                    <vaadin-tabs @selected-changed="${this.selectedChanged}">
                        <vaadin-tab theme="icon-on-top">
                            <vaadin-icon icon="vaadin:fire"></vaadin-icon>
                            <span>Flame</span>
                        </vaadin-tab>
                        <vaadin-tab theme="icon-on-top">
                            <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                            <span>Render</span>
                        </vaadin-tab>
                        <vaadin-tab theme="icon-on-top">
                            <vaadin-icon icon="vaadin:info-circle-o"></vaadin-icon>
                            <span>Supported variations</span>
                        </vaadin-tab>
                    </vaadin-tabs>
                    <div style="display: flex; flex-direction: column; width: 100%;">
                        <playground-flame-panel id='flamePnl' 
                          .visible=${this.selectedTab === 0}
                          .onImport="${this.importFlameFromXml}" .onRandomFlame="${this.createRandomFlame}"
                          .onRandomGradient="${this.createRandomGradient}"
                        .onFlameNameChanged="${this.importExampleFlame}"></playground-flame-panel>
                        <playground-render-panel id='viewOptsPnl' .onRefresh="${this.rerenderFlame}" 
                          .onCaptureImage="${this.saveImage}"
                          .visible=${this.selectedTab === 1} .onImageSizeChanged="${this.rerenderFlame}"></playground-render-panel>
                        <playground-variations-panel .visible=${this.selectedTab === 2}>
    

                        </playground-variations-panel>
                        <label>Captured image: (use right-click and save-as to export)</label>
                        <div style="max-height: 10em;max-width:20em;overflow: scroll;" id="captured-image-container"></div>
                    </div>
     
                </div>
             </vaadin-split-layout>
        `;
    }

    selectedChanged(e: CustomEvent) {
        this.selectedTab = e.detail.value;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.canvasContainer = document.querySelector('#canvas-container')!
        this.capturedImageContainer = document.querySelector('#captured-image-container')!

        this.viewOptsPanel = document.querySelector('#viewOptsPnl')!
        this.flamePanel = document.querySelector('#flamePnl')!
        playgroundStore.registerInitCallback([this.flamePanel.tagName, this.viewOptsPanel.tagName], this.renderFirstFlame)
    }

    private getTabStyle(ownTabIdx: number, selectedTab: number) {
        return ownTabIdx === selectedTab ? html`display: block;` : html`display: none;`;
    }


    recreateCanvas = ()=> {
        this.canvasContainer.innerHTML = '';
        this.canvas = document.createElement('canvas')
        this.canvas.id = "screen1"
        this.canvas.width = 512
        this.canvas.height = 512
        this.canvasContainer.appendChild(this.canvas)
    }

    saveImage =()=> {
        this.capturedImageContainer.innerHTML = ''
        playgroundStore.renderer.saveCurrentImageToContainer(this.canvas, this.capturedImageContainer)
    }

    rerenderFlame = ()=> {
        let brightnessElement = this.viewOptsPanel.brightnessElement
        let param1Element = this.viewOptsPanel.param1Element
        let radioButtonElements = this.viewOptsPanel.displayModeElements
        this.recreateCanvas()
        playgroundStore.renderer = new FlameRenderer(this.viewOptsPanel.imageSize, this.viewOptsPanel.swarmSize, this.canvas, playgroundStore.flame, brightnessElement, radioButtonElements, param1Element);
        playgroundStore.renderer.drawScene()
    }

    importFlameFromXml = () => {
        playgroundStore.calculating = true
        playgroundStore.lastError = ''
        FlamesEndpoint.parseFlame(this.flamePanel.flameXml).then(flame => {
          playgroundStore.flame = FlameMapper.mapFromBackend(flame)
          this.rerenderFlame()
          playgroundStore.calculating = false
        }).catch(err=> {
            playgroundStore.calculating = false
            playgroundStore.lastError = err
        })
    }

    createRandomFlame = () => {
        playgroundStore.calculating = true
        playgroundStore.lastError = ''

        FlamesEndpoint.generateRandomFlame(playgroundStore.variations).then(
            randomFlame => {
                this.flamePanel.flameXml = randomFlame.flameXml
                playgroundStore.flame = FlameMapper.mapFromBackend(randomFlame.flame)
                this.rerenderFlame()
                playgroundStore.calculating = false
            }
        ).catch(err=> {
            playgroundStore.calculating = false
            playgroundStore.lastError = err
        })
    }

    createRandomGradient = () => {
        playgroundStore.calculating = true
        playgroundStore.lastError = ''

        FlamesEndpoint.generateRandomGradientForFlame(FlameMapper.mapToBackend(playgroundStore.flame)).then(
            randomFlame => {
                this.flamePanel.flameXml = randomFlame.flameXml
                playgroundStore.flame = FlameMapper.mapFromBackend(randomFlame.flame)
                this.rerenderFlame()
                playgroundStore.calculating = false
            }
        ).catch(err=> {
            playgroundStore.calculating = false
            playgroundStore.lastError = err
        })
    }

    importExampleFlame = (): void => {
        playgroundStore.calculating = true
        playgroundStore.lastError = ''

        FlamesEndpoint.getExampleFlame(this.flamePanel.flameName).then(flame => {
            playgroundStore.flame = FlameMapper.mapFromBackend(flame)
            this.rerenderFlame()
            playgroundStore.calculating = false
        }).catch(err=> {
                playgroundStore.calculating = false
                playgroundStore.lastError = err
            })
    }

    renderFirstFlame = ()=> {
        const idx = Math.floor(this.flamePanel.flameNames.length * Math.random())
        this.flamePanel.flameName = this.flamePanel.flameNames[idx]
        this.importExampleFlame()
    }
}