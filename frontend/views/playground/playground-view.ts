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
import './playground-view-opts-panel'
import './playground-flame-panel'
import '@vaadin/split-layout';

import {PlaygroundViewOptsPanel} from "Frontend/views/playground/playground-view-opts-panel";
import {playgroundStore} from "Frontend/stores/playground-store";
import {PlaygroundFlamePanel} from "Frontend/views/playground/playground-flame-panel";

@customElement('playground-view')
export class PlaygroundView extends View {
    canvasContainer!: HTMLDivElement;

    @state()
    imageSize = 512

    imageSizes = [256, 512, 1024, 2048]

    @state()
    pointsSize = 512

    pointsSizes = [64, 128, 256, 512]

    @state()
    selectedTab = 0

    viewOptsPanel!: PlaygroundViewOptsPanel
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
                        <vaadin-combo-box label="Image size" .items="${this.imageSizes}" value="${this.imageSize}"
                                          @change="${(event: Event) => this.imageSizeChanged(event)}"></vaadin-combo-box>
                      </div>

                    <vaadin-tabs @selected-changed="${this.selectedChanged}">
                        <vaadin-tab theme="icon-on-top">
                            <vaadin-icon icon="vaadin:user"></vaadin-icon>
                            <span>Flame</span>
                        </vaadin-tab>
                        <vaadin-tab theme="icon-on-top">
                            <vaadin-icon icon="vaadin:cog"></vaadin-icon>
                            <span>Render settings</span>
                        </vaadin-tab>
                        <vaadin-tab theme="icon-on-top">
                            <vaadin-icon icon="vaadin:bell"></vaadin-icon>
                            <span>Shader code</span>
                        </vaadin-tab>
                    </vaadin-tabs>
                    <div style="display: flex; flex-direction: column; width: 100%;">
                        <playground-flame-panel id='flamePnl' .visible=${this.selectedTab === 0}
                                                .onImport="${this.importFlameFromXml}" .onFlameNameChanged="${this.renderFlame}"></playground-flame-panel>
                        <playground-view-opts-panel id='viewOptsPnl' .onRefresh="${this.renderFlame}"
                                                    .visible=${this.selectedTab === 1}></playground-view-opts-panel>
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
            const renderer = new FlameRenderer(this.imageSize, this.pointsSize, canvas, FlameMapper.mapFromBackend(flame), brightnessElement, radioButtonElements, param1Element);
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

    private imageSizeChanged(event: Event) {
        if ((event.target as HasValue<string>).value) {
            this.imageSize = parseInt((event.target as HasValue<string>).value!)
            this.renderFlame()
        }
    }

    private getTabStyle(ownTabIdx: number, selectedTab: number) {
        return ownTabIdx === selectedTab ? html`display: block;` : html`display: none;`;
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
            const renderer = new FlameRenderer(this.imageSize, this.pointsSize, canvas, FlameMapper.mapFromBackend(flame), brightnessElement, radioButtonElements, param1Element);
            renderer.drawScene()
        })
    }
}