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
import {customElement, state} from 'lit/decorators.js';
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '@vaadin/vaadin-grid'
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel, NumberFieldDescriptor} from "./edit-property-panel";
import {editorStore} from "Frontend/stores/editor-store";
import {Layer} from "Frontend/flames/model/flame";
import {GridActiveItemChangedEvent} from "@vaadin/grid";

@localized()
@customElement('editor-edit-layers-panel')
export class EditorEditLayersPanel extends EditPropertyPanel {

  @state()
  private selectedItems: Layer[] = [];

  private density: NumberFieldDescriptor = {
    key: 'density', label: msg('Density'), min: 0, max: 2, step: 0.1,
    onChange: this.layerPropertyChange.bind(this,'density'),
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
             }}"
          >
            <vaadin-grid-column frozen path="weight"></vaadin-grid-column>
            <vaadin-grid-column frozen path="density"></vaadin-grid-column>
          </vaadin-grid>
        </vaadin-vertical-layout>
        ${this.renderNumberField(this.density)}
      </vaadin-horizontal-layout>
    `;
  }


}

