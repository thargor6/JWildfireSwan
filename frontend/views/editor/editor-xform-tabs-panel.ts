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
import {customElement, property, query} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";

import '@vaadin/vaadin-menu-bar';
import '@vaadin/icon';
import '@vaadin/icons';

import './editor-edit-xform-affine-panel'
import './editor-edit-xform-nonlinear-panel'
import './editor-edit-xform-xaos-panel'
import './editor-edit-xform-color-panel'

import {EditorEditXformAffinePanel} from "Frontend/views/editor/editor-edit-xform-affine-panel";
import {EditorEditXformColorPanel} from "Frontend/views/editor/editor-edit-xform-color-panel";
import {EditorEditXformNonlinearPanel} from "Frontend/views/editor/editor-edit-xform-nonlinear-panel";

import {localized, msg} from '@lit/localize';
import {state} from "lit/decorators.js";


@localized()
@customElement('editor-xform-tabs-panel')
export class EditorXformTabsPanel extends MobxLitElement {

  @state()
  selectedTransformTab = 0

  @property()
  reRender = ()=> {}

  @property()
  fluidReRender = () => {}


  @query('editor-edit-xform-affine-panel')
  xformAffinePanel!: EditorEditXformAffinePanel

  @query('editor-edit-xform-color-panel')
  xformColorPanel!: EditorEditXformColorPanel

  @query('editor-edit-xform-nonlinear-panel')
  xformNonlinearPanel!: EditorEditXformNonlinearPanel

  render() {
    return html `
           <div style="display: flex; flex-direction: column; padding: 0.5em;">
              
                <vaadin-tabs @selected-changed="${this.selectedTransformTabChanged}">
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:function"></vaadin-icon>
                        <span>${msg('Affine')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:spline-chart"></vaadin-icon>
                        <span>${msg('Nonlinear')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:grid-small-o"></vaadin-icon>
                        <span>${msg('Xaos')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:paintbrush"></vaadin-icon>
                        <span>${msg('Color')}</span>
                    </vaadin-tab>
                </vaadin-tabs>
               <vaadin-scroller style="height: 22em; width: 100%;">
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                  <editor-edit-xform-affine-panel .visible=${this.selectedTransformTab === 0}
                    .afterPropertyChange=${this.reRender} .onPropertyChange=${this.fluidReRender} ></editor-edit-xform-affine-panel>
                  <editor-edit-xform-nonlinear-panel .visible=${this.selectedTransformTab === 1}
                    .afterPropertyChange=${this.reRender}></editor-edit-xform-nonlinear-panel>
                  <editor-edit-xform-xaos-panel .visible=${this.selectedTransformTab === 2}
                    .afterPropertyChange=${this.reRender}></editor-edit-xform-xaos-panel>
                  <editor-edit-xform-color-panel .visible=${this.selectedTransformTab === 3}
                    .afterPropertyChange=${this.reRender}></editor-edit-xform-color-panel>
                 </div>
               </vaadin-scroller>
           </div>`

  }

  selectedTransformTabChanged(e: CustomEvent) {
    this.selectedTransformTab = e.detail.value;
  }


}
