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
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import {customElement} from 'lit/decorators.js';
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";
import {editorStore} from "Frontend/stores/editor-store";
import {Parameters} from "Frontend/flames/model/parameters";
import {FlameEditService} from "Frontend/flames/service/flame-edit-service";

@localized()
@customElement('editor-edit-xform-color-panel')
export class EditorEditXformColorPanel extends EditPropertyPanel {
  private flameEditService = new FlameEditService()

  private color: NumberFieldDescriptor = {
    key: 'color', label: msg('Color'), min: 0, max: 1, step: 0.01,
    onChange: this.xformPropertyChange.bind(this,'color'),
    value: this.getXformValue.bind(this,'color')
  }

  private colorSymmetry: NumberFieldDescriptor = {
    key: 'colorSymmetry', label: msg('Color speed'), min: -1, max: 1, step: 0.01,
    onChange: this.xformPropertyChange.bind(this,'colorSymmetry'),
    value: this.getXformValue.bind(this,'colorSymmetry')
  }

  private weight: NumberFieldDescriptor = {
    key: 'weight', label: msg('Weight'), min: 0, max: 10, step: 0.25,
    onChange: this.xformPropertyChange.bind(this,'weight'),
    value: this.getXformValue.bind(this,'weight')
  }

  renderControls() {
    return html`
        <vaadin-vertical-layout>
          ${this.renderNumberField(this.weight)}
          ${this.renderNumberField(this.color)}
          ${this.renderNumberField(this.colorSymmetry)}
          <div style="flex; flex-direction: row; flex-wrap: wrap;">
            <vaadin-button ?disabled=${undefined===editorStore.currLayer} @click="${this.randomizeColors}">${msg('Randomize colors')}</vaadin-button>
            <vaadin-button ?disabled=${undefined===editorStore.currLayer} @click="${this.randomizeColorSymmetry}">${msg('Randomize color speed')}</vaadin-button>
            <vaadin-button ?disabled=${undefined===editorStore.currLayer} @click="${this.resetColors}">${msg('Reset colors')}</vaadin-button>
            <vaadin-button ?disabled=${undefined===editorStore.currLayer} @click="${this.distributeColors}">${msg('Distribute colors')}</vaadin-button>
          </div>  
        </vaadin-vertical-layout>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.registerControl(this.weight)
    this.registerControl(this.color)
    this.registerControl(this.colorSymmetry)
    this.updateControlReferences(true)
  }

  randomizeColors = ()=> {
    if(editorStore.currLayer) {
      this.flameEditService.randomizeColors(editorStore.currLayer)
      this.afterPropertyChange()
      this.requestContentUpdate()
    }
  }

  randomizeColorSymmetry = ()=> {
    if(editorStore.currLayer) {
      this.flameEditService.randomizeColorSymmetry(editorStore.currLayer)
      this.afterPropertyChange()
      this.requestContentUpdate()
    }
  }

  resetColors = ()=> {
    if(editorStore.currLayer) {
      this.flameEditService.resetColors(editorStore.currLayer)
      this.afterPropertyChange()
      this.requestContentUpdate()
    }
  }

  distributeColors = ()=> {
    if(editorStore.currLayer) {
      this.flameEditService.distributeColors(editorStore.currLayer)
      this.afterPropertyChange()
      this.requestContentUpdate()
    }
  }

}

