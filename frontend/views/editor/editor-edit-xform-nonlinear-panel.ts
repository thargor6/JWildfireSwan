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
import {customElement, queryAll} from 'lit/decorators.js';
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '../../components/swan-variation-edit-panel'
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel} from "Frontend/views/editor/edit-property-panel";
import {editorStore} from "Frontend/stores/editor-store";
import {Variation} from "Frontend/flames/model/flame";
import {state} from "lit/decorators";
import {SwanVariationEditPanel} from "Frontend/components/swan-variation-edit-panel";

@localized()
@customElement('editor-edit-xform-nonlinear-panel')
export class EditorEditXformNonlinearPanel extends EditPropertyPanel {

  @state()
  items: Variation[] = []

  @queryAll('swan-variation-edit-panel')
  panels!: SwanVariationEditPanel[]

  renderControls() {
    return html`
         <vaadin-vertical-layout>
             <vaadin-button ?disabled="${undefined===editorStore.currXform}" @click="${this.addVariation}">${msg('Add variation')}</vaadin-button>
            ${this.items.map(variation => {
                return html `<swan-variation-edit-panel .variation=${variation} 
                               .afterPropertyChange=${this.afterPropertyChange}
                               .onAfterVariationChange=${this.refreshVariations}>
                             </swan-variation-edit-panel>`
            })}
         </vaadin-vertical-layout>
    `;
  }

  addVariation = ()=> {
    if(editorStore.currXform) {
      const variation = new Variation()
      editorStore.currXform.variations.push(variation)
      this.refreshVariations()
      this.afterPropertyChange()
    }
  }

  refreshVariations = () => {
    this.items = editorStore.currXform ? [...editorStore.currXform.variations] : []
  }

  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);
    for(let panel of this.panels) {
      panel.refreshProperties()
    }
  }

}

