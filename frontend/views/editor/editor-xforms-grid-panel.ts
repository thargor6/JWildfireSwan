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
import {editorStore} from "Frontend/stores/editor-store";
import {MobxLitElement} from "@adobe/lit-mobx";
import {XForm} from "Frontend/flames/model/flame";
import {Grid, GridActiveItemChangedEvent, GridItemModel} from "@vaadin/grid";
import {floatToStr} from "Frontend/components/utils";

@localized()
@customElement('editor-xforms-grid-panel')
export class EditorXformsGridPanel extends MobxLitElement {
  @state()
  private selectedItems: XForm[] = [];

  @query('vaadin-grid')
  grid!: Grid

  render() {
    return html`
        <vaadin-vertical-layout style="margin-left: 1em;">
          <h4>${msg('Transformations')}</h4>
          <vaadin-grid style="width: 9em; height: 24em;" theme="compact" .items="${editorStore.currXforms}"
              .selectedItems="${this.selectedItems}" @active-item-changed="${(e: GridActiveItemChangedEvent<XForm>) => {
                const item = e.detail.value;
                this.selectedItems = item ? [item] : [];
                editorStore.currXform = item ? item : undefined
            }}">
            <vaadin-grid-column header="${msg('Transformation')}" .renderer="${this.txColRenderer}"></vaadin-grid-column>
          </vaadin-grid>
        </vaadin-vertical-layout>
      `
  }
/*
            <vaadin-grid-column header="${msg('Weight')}" .renderer="${this.weightColRenderer}"></vaadin-grid-column>

 */

  private txColRenderer = (root: HTMLElement, _: HTMLElement, model: GridItemModel<XForm>) => {
    if(editorStore.currLayer) {
      {
        const txIdx = editorStore.currLayer.xforms.indexOf(model.item)
        if (txIdx >= 0) {
          render(html`${msg('XForm')} ${txIdx.toString() + 1}`, root)
          return
        }
      }
      {
        const finalTxIdx = editorStore.currLayer.finalXforms.indexOf(model.item)
        if (finalTxIdx >= 0) {
          render(html`${msg('FinalXF')} ${finalTxIdx.toString() + 1}`, root)
          return
        }
      }
    }
  }

  private weightColRenderer = (root: HTMLElement, _: HTMLElement, model: GridItemModel<XForm>) => {
    render(html` ${floatToStr(model.item.weight.value)}`, root)
  }

  selectFirstXform = ()=> {
    if(editorStore.currXforms.length>0) {
      const event = new CustomEvent('active-item-changed', { detail: { value: editorStore.currXforms[0]} });
      this.grid.dispatchEvent(event)
    }
  }
}

