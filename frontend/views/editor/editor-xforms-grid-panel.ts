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

import {html, PropertyValues, render} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '@vaadin/vaadin-grid'
import '@vaadin/vaadin-button'
import '@vaadin/radio-group'
import {localized, msg} from "@lit/localize";
import {editorStore} from "Frontend/stores/editor-store";
import {MobxLitElement} from "@adobe/lit-mobx";
import {XForm} from "Frontend/flames/model/flame";
import {Grid, GridActiveItemChangedEvent, GridItemModel} from "@vaadin/grid";
import {floatToStr} from "Frontend/components/utils";
import './editor-xform-toolbar-panel'
import {FlameEditService} from "Frontend/flames/service/flame-edit-service";
import {property} from "lit/decorators";

@localized()
@customElement('editor-xforms-grid-panel')
export class EditorXformsGridPanel extends MobxLitElement {
  private flameEditService = new FlameEditService()

  @state()
  private selectedItems: XForm[] = [];

  @query('vaadin-grid')
  grid!: Grid

  @property()
  afterPropertyChange = ()=>{}

  render() {
    return html`
        <vaadin-vertical-layout style="margin-left: 1em;">
            <vaadin-radio-group label="${msg('Edit transformations')}" theme="horizontal">
                <vaadin-radio-button value="affine" label="${msg('Affine')}" @checked-changed="${(e: CustomEvent)=>editorStore.checkedSetEditModeTxAffine(e.detail.value)}" ?checked="${editorStore.isEditModeAffine()}"></vaadin-radio-button>
                <vaadin-radio-button value="post" label="${msg('Post')}" @checked-changed="${(e: CustomEvent)=>editorStore.checkedSetEditModeTxPost(e.detail.value)}" ?checked="${editorStore.isEditModePost()}"></vaadin-radio-button>
                <vaadin-radio-button value="both" label="${msg('A+P')}" @checked-changed="${(e: CustomEvent)=>editorStore.checkedSetEditModeTxPostAffine(e.detail.value)}" ?checked="${editorStore.isEditModeAffinePost()}"></vaadin-radio-button>

            </vaadin-radio-group>
            
            <editor-xform-toolbar-panel
                   .onAddTransform=${this.onAddTransform}
                   .onAddLinkedTransform=${this.onAddLinkedTransform}
                   .onAddFinalTransform=${this.onAddFinalTransform}
                   .onEditDeleteTransform=${this.onEditDeleteTransform}
                   .onEditDuplicateTransform=${this.onEditDuplicateTransform}
                   .onEditTransformName=${this.onEditTransformName}
               ></editor-xform-toolbar-panel>
            
          <vaadin-grid style="width: 9em; height: 19em;" theme="compact" .items="${editorStore.currXforms}"
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

  // TODO display name column
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

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    editorStore.notifyInit('editor-xforms-grid-panel')
  }

  onAddTransform = ()=> {
    if(editorStore.currLayer) {
      this.flameEditService.addTransform(editorStore.currLayer)
      editorStore.currLayer = editorStore.currLayer
      this.reRender()
    }
  }

  onAddLinkedTransform = ()=> {
    if(editorStore.currLayer && editorStore.currXform) {
      this.flameEditService.addLinkedTransform(editorStore.currLayer, editorStore.currXform)
      editorStore.currLayer = editorStore.currLayer
      this.reRender()
    }
  }

  onAddFinalTransform = ()=> {
    if(editorStore.currLayer) {
      this.flameEditService.addFinalTransform(editorStore.currLayer)
      editorStore.currLayer = editorStore.currLayer
      this.reRender()
    }
  }

  onEditDeleteTransform = ()=> {
    if(editorStore.currLayer && editorStore.currXform) {
      this.flameEditService.deleteTransform(editorStore.currLayer, editorStore.currXform)
      editorStore.currLayer = editorStore.currLayer
      this.reRender()
    }
  }

  onEditDuplicateTransform = ()=> {
    if(editorStore.currLayer && editorStore.currXform) {
      this.flameEditService.duplicateTransform(editorStore.currLayer, editorStore.currXform)
      editorStore.currLayer = editorStore.currLayer
      this.reRender()
    }
  }

  onEditTransformName = ()=> {
    if(editorStore.currLayer && editorStore.currXform) {
// TODO
    //  this.notificationPnl.showNotifivation(msg('Not implemented yet'))
    }
  }


  private reRender() {
    this.afterPropertyChange()
  }
}

