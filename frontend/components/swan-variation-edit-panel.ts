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
import {customElement, property} from 'lit/decorators.js';

import '@vaadin/vaadin-button'
import '@vaadin/vaadin-combo-box'
import {Variation} from "Frontend/flames/model/flame"
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import {EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";
import {msg} from "@lit/localize";
import {editorStore} from "Frontend/stores/editor-store";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";
import {Parameters} from "Frontend/flames/model/parameters";
import {VariationParamType} from "Frontend/flames/renderer/variations/variation-shader-func";

@customElement('swan-variation-edit-panel')
export class SwanVariationEditPanel extends EditPropertyPanel {

  @property()
  variation: Variation = new Variation()

  renderControls() {
    const amount: NumberFieldDescriptor = {
      key: 'amount', label: msg('Amount'), min: -5, max: 5, step: 0.01,
      onChange: this.variationPropertyChange.bind(this, this.variation, 'amount'),
      value: this.getVariationValue.bind(this, this.variation, 'amount')
    }
    const paramsDesc: NumberFieldDescriptor[] = []
    this.variation.params.forEach(( value, key, map)=> {
      paramsDesc.push({
        key: key, label: msg(key), min: -5, max: 5, step: 0.01,
        onChange: this.variationPropertyChange.bind(this, this.variation, key),
        value: this.getVariationValue.bind(this, this.variation, key)
      })
    })

    return html `
      <vaadin-vertical-layout>
        <vaadin-horizontal-layout>  
          <vaadin-combo-box style="min-width: 20em;" @value-changed="${this.variationChanged}" value="${this.variation.name}" .items=${editorStore.variations}></vaadin-combo-box>
          <vaadin-button @click="${this.deleteVariation}">${msg('Delete')}</vaadin-button>  
        </vaadin-horizontal-layout>
        ${this.renderNumberField(amount)}
        ${paramsDesc.map(paramDesc=>this.renderNumberField(paramDesc))}
      </vaadin-vertical-layout>
    `
  }

  deleteVariation = ()=> {
    if(editorStore.currXform) {
      const idx = editorStore.currXform.variations.indexOf(this.variation)
      if(idx>=0) {
        editorStore.currXform.variations.splice(idx, 1)
        const prevXform = editorStore.currXform
        editorStore.currLayer = editorStore.currLayer
        editorStore.currXform = prevXform
        this.afterPropertyChange()
      }
    }
  }

  variationChanged = (e: CustomEvent) => {
    if(editorStore.currXform && e && e.detail && e.detail.value) {
      const idx = editorStore.currXform.variations.indexOf(this.variation)
      if(idx>=0) {
        let newVariation = new Variation()
        newVariation.amount = this.variation.amount
        newVariation.name = e.detail.value

        VariationShaders.getVariationParams(newVariation.name).forEach((param)=>{
          newVariation.params.set(param.name, param.type===VariationParamType.VP_INT ? Parameters.intParam(param.initialValue) : Parameters.floatParam(param.initialValue))
        })

        editorStore.currXform.variations = [...editorStore.currXform.variations.slice(0, idx), newVariation, ...editorStore.currXform.variations.slice(idx+1, editorStore.currXform.variations.length - idx)]
        this.variation = newVariation
        const prevXform = editorStore.currXform
        editorStore.currLayer = editorStore.currLayer
        editorStore.currXform = prevXform
        this.afterPropertyChange()
      }
    }
  }

}
