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

import {html, render} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '@vaadin/vaadin-grid'
import '@vaadin/vaadin-button'
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel, NumberFieldDescriptor} from "./edit-property-panel";
import {editorStore} from "Frontend/stores/editor-store";
import {Layer} from "Frontend/flames/model/flame";
import {Grid, GridActiveItemChangedEvent, GridItemModel} from "@vaadin/grid";
import {floatToStr} from "Frontend/components/utils";

@localized()
@customElement('editor-edit-layers-panel')
export class EditorEditLayersPanel extends EditPropertyPanel {

  @state()
  private selectedItems: Layer[] = [];

  @query('vaadin-grid')
  grid!: Grid

  onAttributeChange = (key: string, value: number, isImmediateValue: boolean) => {
    this.layerPropertyChange(key, value, isImmediateValue)
    this.grid.requestContentUpdate()
  }

  private weight: NumberFieldDescriptor = {
    key: 'weight', label: msg('Weight'), min: 0, max: 2, step: 0.1,
    onChange: this.onAttributeChange.bind(this,'weight'),
    value: this.getLayerValue.bind(this,'density')
  }

  private density: NumberFieldDescriptor = {
    key: 'density', label: msg('Density'), min: 0, max: 2, step: 0.1,
    onChange: this.onAttributeChange.bind(this,'density'),
    value: this.getLayerValue.bind(this,'density')
  }

  renderControls() {
    return html`
      <vaadin-horizontal-layout theme="spacing">
        <vaadin-vertical-layout>
          <h2>${msg('Layers')}</h2>
          <vaadin-grid theme="no-border" style="width: 30em; height: 12em;" .items="${editorStore.currLayers}"
            .selectedItems="${this.selectedItems}" @active-item-changed="${(e: GridActiveItemChangedEvent<Layer>) => {
              const item = e.detail.value;
              this.selectedItems = item ? [item] : [];
              editorStore.currLayer = item ? item : undefined
             }}">
            <vaadin-grid-column frozen header="${msg('Layer')}" .renderer="${this.layerColRenderer}"></vaadin-grid-column>
            <vaadin-grid-column frozen header="${msg('Density')}" text-align="end" .renderer="${this.densityColRenderer}"></vaadin-grid-column>
            <vaadin-grid-column frozen header="${msg('Weight')}" text-align="end" .renderer="${this.weightColRenderer}"></vaadin-grid-column>
          </vaadin-grid>
        </vaadin-vertical-layout>
        <vaadin-vertical-layout>
          <vaadin-button style="width: 7em;" @click="${this.addLayer}">${msg('Add')}</vaadin-button>
          <vaadin-button style="width: 7em;" ?disabled="${undefined===editorStore.currLayer}" @click="${this.duplicateLayer}">${msg('Duplicate')}</vaadin-button>
          <vaadin-button style="width: 7em;" ?disabled="${undefined===editorStore.currLayer}" @click="${this.deleteLayer}">${msg('Delete')}</vaadin-button>
        </vaadin-vertical-layout>
        <vaadin-vertical-layout>
          ${this.renderNumberField(this.weight)}
          ${this.renderNumberField(this.density)}
        </vaadin-vertical-layout>
      </vaadin-horizontal-layout>
    `
  }

  private layerColRenderer = (root: HTMLElement, _: HTMLElement, model: GridItemModel<Layer>) => {
    render(html`${msg('Layer')} ${editorStore.currLayers.indexOf(model.item) + 1}`, root)
  }

  private densityColRenderer = (root: HTMLElement, _: HTMLElement, model: GridItemModel<Layer>) => {
    render(html` ${floatToStr(model.item.density.value)}`, root)
  }

  private weightColRenderer = (root: HTMLElement, _: HTMLElement, model: GridItemModel<Layer>) => {
    render(html` ${floatToStr(model.item.weight.value)}`, root)
  }

  addLayer = () => {
    editorStore.currFlame.addLayer()
    editorStore.refreshLayers()
  }

  duplicateLayer = () => {
    if(this.selectedItems.length>0) {
      editorStore.currFlame.duplicateLayer(this.selectedItems[0])
      editorStore.refreshLayers()
    }

  }

  deleteLayer = () => {
    if(this.selectedItems.length>0) {
      editorStore.currFlame.deleteLayer(this.selectedItems[0])
      this.selectedItems=[]
      editorStore.refreshLayers()
    }
  }

  selectFirstLayer = ()=> {
    if(editorStore.currLayers.length>0) {
      const event = new CustomEvent('active-item-changed', { detail: { value: editorStore.currLayers[0]} });
      this.grid.dispatchEvent(event)
    }
  }
}

