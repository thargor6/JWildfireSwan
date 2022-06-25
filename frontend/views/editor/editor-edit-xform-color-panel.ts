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
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import {customElement} from 'lit/decorators.js';
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";
import {editorStore} from "Frontend/stores/editor-store";
import {Parameters} from "Frontend/flames/model/parameters";

@localized()
@customElement('editor-edit-xform-color-panel')
export class EditorEditXformColorPanel extends EditPropertyPanel {

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
        ${this.renderNumberField(this.weight)}
        ${this.renderNumberField(this.color)}
        ${this.renderNumberField(this.colorSymmetry)}
        <vaadin-button ?disabled=${undefined===editorStore.currLayer} @click="${this.randomizeColors}">${msg('Randomize colors')}</vaadin-button>
        <vaadin-button ?disabled=${undefined===editorStore.currLayer} @click="${this.randomizeColorSymmetry}">${msg('Randomize color speed')}</vaadin-button>
        <vaadin-button ?disabled=${undefined===editorStore.currLayer} @click="${this.resetColors}">${msg('Reset colors')}</vaadin-button>
        <vaadin-button ?disabled=${undefined===editorStore.currLayer} @click="${this.distributeColors}">${msg('Distribute colors')}</vaadin-button>
    `;
  }

  randomizeColors = ()=> {
    if(editorStore.currLayer) {
      editorStore.currLayer.randomizeColors()
      this.afterPropertyChange()
      this.refreshForm()
      this.requestUpdate()
    }
  }

  randomizeColorSymmetry = ()=> {
    if(editorStore.currLayer) {
      editorStore.currLayer.randomizeColorSymmetry()
      this.afterPropertyChange()
      this.refreshForm()
      this.requestUpdate()
    }
  }

  resetColors = ()=> {
    if(editorStore.currLayer) {
      editorStore.currLayer.resetColors()
      this.afterPropertyChange()
      this.refreshForm()
      this.requestUpdate()
    }
  }

  distributeColors = ()=> {
    if(editorStore.currLayer) {
      editorStore.currLayer.distributeColors()
      this.afterPropertyChange()
      this.refreshForm()
      this.requestUpdate()
    }
  }

  private refreshForm = () => {
    if(editorStore.currXform) {
      editorStore.currXform.weight = Parameters.floatParam(editorStore.currXform.weight.value)
      editorStore.currXform.color = Parameters.floatParam(editorStore.currXform.color.value)
      editorStore.currXform.colorSymmetry = Parameters.floatParam(editorStore.currXform.colorSymmetry.value)
    }
  }
}

