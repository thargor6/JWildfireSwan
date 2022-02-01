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

import {html, nothing, PropertyValues, render} from 'lit';
import { guard } from 'lit/directives/guard.js';
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
import {HasValue} from "@vaadin/form";
import '@vaadin/vaadin-combo-box';
import './playground-render-panel'
import './playground-flame-panel'
import './playground-variations-panel'
import '@vaadin/split-layout';

import {PlaygroundRenderPanel} from "Frontend/views/playground/playground-render-panel";
import {playgroundStore} from "Frontend/stores/playground-store";
import {PlaygroundFlamePanel} from "Frontend/views/playground/playground-flame-panel";

@customElement('playground-view')
export class PlaygroundView extends View {
    canvasContainer!: HTMLDivElement;

    @state()
    selectedTab = 0

    viewOptsPanel!: PlaygroundRenderPanel
    flamePanel!: PlaygroundFlamePanel

    render() {
        return html`
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
                        .onFlameNameChanged="${this.renderFlame}"></playground-flame-panel>
                        <playground-render-panel id='viewOptsPnl' .onRefresh="${this.renderFlame}"
                          .visible=${this.selectedTab === 1} .onImageSizeChanged="${this.renderFlame}"></playground-render-panel>
                        <playground-variations-panel .visible=${this.selectedTab === 2}></playground-variations-panel>
                    </div>
                </div>
            </vaadin-split-layout>
        `;
    }

    selectedChanged(e: CustomEvent) {
        this.selectedTab = e.detail.value;
    }

    renderFlame = (): void => {
        this.canvasContainer.innerHTML = '';
        var brightnessElement = this.viewOptsPanel.brightnessElement // document.querySelector("#brightness") as HTMLElement;
        var param1Element = this.viewOptsPanel.param1Element // document.querySelector("#param1") as HTMLElement;
        var radioButtonElements = this.viewOptsPanel.displayModeElements // document.getElementsByName('displayMode') ;
        var canvas = document.createElement('canvas');

        canvas.id = "screen1";
        canvas.width = 512;
        canvas.height = 512;
        this.canvasContainer.appendChild(canvas);

        FlamesEndpoint.getExampleFlame(this.flamePanel.flameName).then(flame => {
            console.log("FLAME", flame)
            const renderer = new FlameRenderer(this.viewOptsPanel.imageSize, this.viewOptsPanel.pointsSize, canvas, FlameMapper.mapFromBackend(flame), brightnessElement, radioButtonElements, param1Element);
            renderer.drawScene()
        })
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.canvasContainer = document.querySelector('#canvas-container')!
        this.viewOptsPanel = document.querySelector('#viewOptsPnl')!
        this.flamePanel = document.querySelector('#flamePnl')!
        playgroundStore.registerInitCallback([this.flamePanel.tagName, this.viewOptsPanel.tagName], this.renderFlame)
    }

    private getTabStyle(ownTabIdx: number, selectedTab: number) {
        return ownTabIdx === selectedTab ? html`display: block;` : html`display: none;`;
    }

    createRandomFlame = () => {
        this.canvasContainer.innerHTML = '';

        var brightnessElement = this.viewOptsPanel.brightnessElement // document.querySelector("#brightness") as HTMLElement;
        var param1Element = this.viewOptsPanel.param1Element // document.querySelector("#param1") as HTMLElement;
        var radioButtonElements = this.viewOptsPanel.displayModeElements // document.getElementsByName('displayMode') ;

        var canvas = document.createElement('canvas');

        canvas.id = "screen1";
        canvas.width = 512;
        canvas.height = 512;
        this.canvasContainer.appendChild(canvas);


        FlamesEndpoint.generateRandomFlame(playgroundStore.variations).then(
            randomFlame => {
                this.flamePanel.flameXml = randomFlame.flameXml
                const renderer = new FlameRenderer(this.viewOptsPanel.imageSize, this.viewOptsPanel.pointsSize, canvas, FlameMapper.mapFromBackend(randomFlame.flame), brightnessElement, radioButtonElements, param1Element);
                renderer.drawScene()
            }
        )

    }

    importFlameFromXml = () => {
        console.log("Importing...", this.flamePanel.flameXml);

        this.canvasContainer.innerHTML = '';

        var brightnessElement = this.viewOptsPanel.brightnessElement // document.querySelector("#brightness") as HTMLElement;
        var param1Element = this.viewOptsPanel.param1Element // document.querySelector("#param1") as HTMLElement;
        var radioButtonElements = this.viewOptsPanel.displayModeElements // document.getElementsByName('displayMode') ;

        var canvas = document.createElement('canvas');

        canvas.id = "screen1";
        canvas.width = 512;
        canvas.height = 512;
        this.canvasContainer.appendChild(canvas);

        FlamesEndpoint.parseFlame(this.flamePanel.flameXml).then(flame => {
            console.log("FLAME", flame)
            const renderer = new FlameRenderer(this.viewOptsPanel.imageSize, this.viewOptsPanel.pointsSize, canvas, FlameMapper.mapFromBackend(flame), brightnessElement, radioButtonElements, param1Element);
            renderer.drawScene()
        })
    }
}