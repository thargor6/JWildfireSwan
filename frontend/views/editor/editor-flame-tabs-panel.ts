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

import {html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";

import '@vaadin/vaadin-menu-bar';
import '@vaadin/icon';
import '@vaadin/icons';

import './editor-edit-camera-panel'
import './editor-edit-coloring-panel'
import './editor-edit-denoiser-panel'
import './editor-edit-motion-panel'
import './editor-edit-layers-panel'

import {localized, msg} from '@lit/localize';
import {state} from "lit/decorators";
import {EditorEditCameraPanel} from "Frontend/views/editor/editor-edit-camera-panel";
import {EditorEditColoringPanel} from "Frontend/views/editor/editor-edit-coloring-panel";
import {EditorEditDenoiserPanel} from "Frontend/views/editor/editor-edit-denoiser-panel";
import {EditorEditMotionPanel} from "Frontend/views/editor/editor-edit-motion-panel";
import {EditorEditLayersPanel} from "Frontend/views/editor/editor-edit-layers-panel";

@localized()
@customElement('editor-flame-tabs-panel')
export class EditorFlameTabsPanel extends MobxLitElement {

  @property()
  reRender = ()=> {}

  @property()
  afterLayerChange = ()=>{}

  @state()
  selectedFlameTab = 0

  @query('editor-edit-camera-panel')
  cameraPanel!: EditorEditCameraPanel

  @query('editor-edit-coloring-panel')
  coloringPanel!: EditorEditColoringPanel

  @query('editor-edit-denoiser-panel')
  denoiserPanel!: EditorEditDenoiserPanel

  @query('editor-edit-motion-panel')
  motionPanel!: EditorEditMotionPanel

  @query('editor-edit-layers-panel')
  layersPanel!: EditorEditLayersPanel

  render() {
    return html `
           <div style="display: flex; flex-direction: column; padding: 0.5em;">
                <vaadin-tabs @selected-changed="${this.selectedFlameTabChanged}">
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:viewport"></vaadin-icon>
                        <span>${msg('Camera')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:palette"></vaadin-icon>
                        <span>${msg('Coloring')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:scatter-chart"></vaadin-icon>
                        <span>${msg('Denoiser')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:film"></vaadin-icon>
                        <span>${msg('Motion')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:list-ol"></vaadin-icon>
                        <span>${msg('Layers')}</span>
                    </vaadin-tab>
                </vaadin-tabs>
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                    <editor-edit-camera-panel .visible=${this.selectedFlameTab === 0}
                     .afterPropertyChange=${this.reRender}></editor-edit-camera-panel>
                    <editor-edit-coloring-panel .visible=${this.selectedFlameTab === 1}
                      .afterPropertyChange=${this.reRender}></editor-edit-coloring-panel>
                    <editor-edit-denoiser-panel .visible=${this.selectedFlameTab === 2}
                      .afterPropertyChange=${this.reRender}></editor-edit-denoiser-panel>
                    <editor-edit-motion-panel .visible=${this.selectedFlameTab === 3}
                      .afterPropertyChange=${this.reRender}></editor-edit-motion-panel>
                    <editor-edit-layers-panel .visible=${this.selectedFlameTab === 4}
                      .afterPropertyChange=${this.reRender} .onAfterLayerChanged="${this.afterLayerChange}" ></editor-edit-layers-panel>
                 </div>
           </div>`
  }

  selectedFlameTabChanged(e: CustomEvent) {
    this.selectedFlameTab = e.detail.value;
  }

  requestContentUpdate() {
    this.cameraPanel.requestContentUpdate()
    this.coloringPanel.requestContentUpdate()
    this.denoiserPanel.requestContentUpdate()
    this.layersPanel.requestContentUpdate()
  }

}
