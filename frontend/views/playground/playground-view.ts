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

import {html, PropertyValues, render} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import { View } from '../../views/view'
import { guard } from 'lit/directives/guard.js';

import '@vaadin/vaadin-button'
import '@vaadin/vaadin-text-field'
import '@vaadin/dialog'
import '@vaadin/horizontal-layout'
import '@vaadin/text-area'
import '@vaadin/text-field'
import '@vaadin/vertical-layout'
import '@vaadin/icon'
import '@vaadin/icons'
import '@vaadin/tabs'
import '@vaadin/vaadin-progress-bar'
import '@vaadin/scroller'
import '@vaadin/split-layout';
import '@vaadin/vaadin-notification'
import type { Notification } from '@vaadin/notification';

import {FlameRenderer} from '../../flames/renderer/flame-renderer'
import {AppInfoEndpoint, FlamesEndpoint, GalleryEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from '../../flames/model/mapper/flame-mapper'
import '@vaadin/vaadin-combo-box';
import './playground-render-panel'
import './playground-flame-panel'
import './playground-edit-panel'

import {PlaygroundRenderPanel} from "Frontend/views/playground/playground-render-panel";
import {playgroundStore} from "Frontend/stores/playground-store";
import {PlaygroundFlamePanel} from "Frontend/views/playground/playground-flame-panel";
import '../../components/swan-loading-indicator'
import '../../components/swan-error-panel'
import {BeforeEnterObserver, PreventAndRedirectCommands, Router, RouterLocation} from "@vaadin/router";
import {getTimeStamp} from "Frontend/components/utils";

@customElement('playground-view')
export class PlaygroundView extends View  implements BeforeEnterObserver {
    canvas!: HTMLCanvasElement
    canvasContainer!: HTMLDivElement


    @state()
    selectedTab = 0

    @state()
    renderInfo = ''

    @state()
    renderProgress = 0.0

    lastProgressUpdate = 0.0

    renderSettingsPanel!: PlaygroundRenderPanel
    flamePanel!: PlaygroundFlamePanel
    loadExampleAtStartup: string | undefined = undefined

    render() {
        return html`
            ${this.renderNotification()}
            <vertical-layout theme="spacing">
              <swan-error-panel .errorMessage=${playgroundStore.lastError}></swan-error-panel>
              <div class="gap-m grid list-none m-0 p-0" style="grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));">
                ${this.renderImageContainer()}    
                ${this.renderMainTabs()}
              </div>  
            </vertical-layout>
        `;
    }

    selectedChanged(e: CustomEvent) {
        this.selectedTab = e.detail.value;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.canvasContainer = document.querySelector('#canvas-container')!
        this.renderSettingsPanel = document.querySelector('#viewOptsPnl')!
        this.flamePanel = document.querySelector('#flamePnl')!
        playgroundStore.registerInitCallback([this.flamePanel.tagName, this.renderSettingsPanel.tagName], this.renderFirstFlame)
    }

    private getTabStyle(ownTabIdx: number, selectedTab: number) {
        return ownTabIdx === selectedTab ? html`display: block;` : html`display: none;`;
    }


    recreateCanvas = ()=> {
        this.canvasContainer.innerHTML = '';
        this.canvas = document.createElement('canvas')
        this.canvas.id = "screen1"
        this.canvas.style.width = '28em'
        this.canvas.style.height = '28em'
        this.canvas.width = 512
        this.canvas.height = 512
        this.canvasContainer.appendChild(this.canvas)
    }

    cancelRender = ()=> {
        if(playgroundStore.renderer) {
            playgroundStore.renderer.signalCancel()
        }
    }

    rerenderFlame = ()=> {
        if(playgroundStore.renderer) {
            playgroundStore.renderer.signalCancel()
        }
        this.recreateCanvas()
        this.renderProgress = 0.0
        this.renderInfo = 'Rendering'
        playgroundStore.renderer = new FlameRenderer(this.renderSettingsPanel.imageSize, this.renderSettingsPanel.swarmSize, this.renderSettingsPanel.displayMode, this.canvas, this.renderSettingsPanel.capturedImageContainer, true, playgroundStore.flame);
        this.lastProgressUpdate = getTimeStamp()
        playgroundStore.renderer.onRenderFinished = this.onRenderFinished
        playgroundStore.renderer.onRenderCancelled = this.onRenderCancelled
        playgroundStore.renderer.onUpdateRenderProgress = this.onUpdateRenderProgress
        playgroundStore.renderer.drawScene()
    }

    onRenderFinished = (frameCount: number, elapsedTimeInS: number) => {
       this.renderProgress = 1.0
       this.renderInfo = 'Rendering finished after ' + Math.round((elapsedTimeInS + Number.EPSILON) * 100) / 100 + ' s'
       AppInfoEndpoint.incFlamesRendered()
    }

    onRenderCancelled = (frameCount: number, elapsedTimeInS: number) => {
         console.log("CANCELLED")
    }

    onUpdateRenderProgress = (currSampleCount: number, maxSampleCount: number, frameCount: number, elapsedTimeInSeconds: number)=> {
        const currTimeStamp = getTimeStamp()
        if(currTimeStamp > this.lastProgressUpdate + 333) {
            this.lastProgressUpdate = currTimeStamp
            this.renderProgress = currSampleCount / maxSampleCount
            this.renderInfo = 'Rendering in progress (frame: ' + frameCount + ')'
        }
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

    exportParamsAsXml = (): void => {
        FlamesEndpoint.convertFlameToXml(FlameMapper.mapToBackend(playgroundStore.flame)).then(flameXml => {
            this.flamePanel.flameXml = flameXml
            this.flamePanel.transferFlameToClipbord()
            this.openNotification(1)
        })
          .catch(err=> {
              playgroundStore.lastError = err
          })

    }

    importExampleFlame = (): void => {
        if(!this.flamePanel.flameName) {
            return
        }
        playgroundStore.calculating = true
        playgroundStore.lastError = ''

        FlamesEndpoint.getExampleFlame(this.flamePanel.flameName).then(flame => {
            playgroundStore.flame = FlameMapper.mapFromBackend(flame)
            GalleryEndpoint.getExampleFlameXml(this.flamePanel.flameName).then(
                flameXml => this.flamePanel.flameXml = flameXml
            )

            this.rerenderFlame()
            playgroundStore.calculating = false
        }).catch(err=> {
                playgroundStore.calculating = false
                playgroundStore.lastError = err
            })
    }

    renderFirstFlame = ()=> {
        this.flamePanel.flameName = this.loadExampleAtStartup ? this.loadExampleAtStartup : playgroundStore.randomExampleFlamename()
        this.importExampleFlame()
        if(this.loadExampleAtStartup) {
            GalleryEndpoint.getExampleFlameXml(this.loadExampleAtStartup).then(flameXml => {
                this.flamePanel.flameXml = flameXml
            })
        }
    }

    onBeforeEnter(
        _location: RouterLocation,
        _commands: PreventAndRedirectCommands,
        _router: Router) {
        const exampleName = _location.params['example'] as string;
        if(exampleName && exampleName!=='') {
            this.loadExampleAtStartup = exampleName
        }
    }

    private renderImageContainer = () => {
        return html `
          <vertical-layout>
            <div style="display: flex; flex-direction: column; align-items: center;">  
                <vaadin-scroller style="max-width: 34em; max-height: 34em;" id="canvas-container">
                   <canvas id="screen1" style="width: 400px; height: 300px;" width="512" height="512"></canvas>
                </vaadin-scroller>
                <div style="display: flex; flex-direction: column;">
                    <div style="min-width: 26em;">${this.renderInfo}</div>
                    <vaadin-progress-bar .value=${this.renderProgress} theme="contrast"></vaadin-progress-bar>
                </div>
            </div>
          </vertical-layout>`
    }

    private renderMainTabs = () => {
        return html `
           <div style="display: flex; flex-direction: column; padding: 1em;">
                <vaadin-tabs theme="centered" @selected-changed="${this.selectedChanged}">
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:fire"></vaadin-icon>
                        <span>Flame</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>Render</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>Edit</span>
                    </vaadin-tab>
                </vaadin-tabs>
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                    <playground-flame-panel id='flamePnl' 
                      .visible=${this.selectedTab === 0}
                      .onImport="${this.importFlameFromXml}" .onRandomFlame="${this.createRandomFlame}"
                      .onRandomGradient="${this.createRandomGradient}"
                    .onFlameNameChanged="${this.importExampleFlame}"></playground-flame-panel>
                    <playground-render-panel id='viewOptsPnl' .onRefresh="${this.rerenderFlame}"
                                             .onCancelRender="${this.cancelRender}"
                      .visible=${this.selectedTab === 1} .onImageSizeChanged="${this.rerenderFlame}"></playground-render-panel>
                    <playground-edit-panel id='editPnl' .onRefresh="${this.rerenderFlame}"
                                           .onExportParams="${this.exportParamsAsXml}"
                                             .visible=${this.selectedTab === 2}></playground-edit-panel>

                 </div>
           </div>`
    }

    private renderNotification() {
        return html `<vaadin-notification
          .renderer="${guard([], () => (root: HTMLElement) => {
              render(
                html`
        <vaadin-horizontal-layout theme="spacing" style="align-items: center">
          <vaadin-icon
            icon="vaadin:check-circle"
            style="color: var(--lumo-success-color)"
          ></vaadin-icon>
          <div>
            <b style="color: var(--lumo-success-text-color);">Export successful</b>
            <div
              style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color)"
            >
              <b>Parameters</b> are now available at the Flame-tab and were copied to the Clipboard
            </div>
          </div>
          <vaadin-button
            theme="tertiary-inline"
            @click="${this.closeNotification.bind(this, 1)}"
            aria-label="Close"
          >
            <vaadin-icon icon="lumo:cross"></vaadin-icon>
          </vaadin-button>
        </vaadin-horizontal-layout>
      `,
                root
              );
          })}"
          position="middle"
        ></vaadin-notification>`
    }

    openNotification(which: number) {
        const notification = this.querySelector(
          `vaadin-notification:nth-child(${which})`
        ) as Notification;
        notification?.open();
    }

    closeNotification(which: number) {
        const notification = this.querySelector(
          `vaadin-notification:nth-child(${which})`
        ) as Notification;
        notification?.close();
    }
}