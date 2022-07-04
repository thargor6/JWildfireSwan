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
import {customElement} from 'lit/decorators.js';
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '../../components/swan-variation-edit-panel'
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel} from "Frontend/views/editor/edit-property-panel";
import {editorStore} from "Frontend/stores/editor-store";
import {Variation} from "Frontend/flames/model/flame";

@localized()
@customElement('editor-edit-xform-nonlinear-panel')
export class EditorEditXformNonlinearPanel extends EditPropertyPanel {
  renderControls() {
    return html`
         <vaadin-vertical-layout>
             <vaadin-button ?disabled="${undefined===editorStore.currXform}" @click="${this.addVariation}">${msg('Add variation')}</vaadin-button>
            ${editorStore.currXform?.variations.map(variation => {
                return html `<swan-variation-edit-panel .variation=${variation} 
                               .afterPropertyChange=${this.afterPropertyChange}>
                             </swan-variation-edit-panel>`
            })}
         </vaadin-vertical-layout>
    `;
  }

  addVariation = ()=> {
    if(editorStore.currXform) {
      const variation = new Variation()
      editorStore.currXform.variations.push(variation)
      const prevXform = editorStore.currXform
      editorStore.currLayer = editorStore.currLayer
      editorStore.currXform = prevXform
      this.afterPropertyChange()
    }
  }

}

