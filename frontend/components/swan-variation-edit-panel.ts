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
import {customElement, property, state} from 'lit/decorators.js';

import '@vaadin/vaadin-progress-bar'
import {Variation} from "Frontend/flames/model/flame";
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import {EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";
import {msg} from "@lit/localize";
import {editorStore} from "Frontend/stores/editor-store";

@customElement('swan-variation-edit-panel')
export class SwanVariationEditPanel extends EditPropertyPanel {
  @property()
  variation: Variation = new Variation()

  renderControls() {
    const varIdx = editorStore.currXform!.variations.indexOf(this.variation)
    const amount: NumberFieldDescriptor = {
      key: 'amount', label: msg('Amount'), min: -5, max: 5, step: 0.01,
      onChange: this.variationPropertyChange.bind(this, this.variation, 'amount'),
      value: this.getVariationValue.bind(this, this.variation, 'amount')
    }
    return html `
      <vaadin-vertical-layout>  
      ${this.variation.name}
      ${this.renderNumberField(amount)}
    `
  }

}
