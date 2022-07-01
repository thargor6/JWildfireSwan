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

import {html, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";

import '@vaadin/vaadin-menu-bar';
import '@vaadin/icon';
import '@vaadin/icons';
import {MenuBarElement} from "@vaadin/vaadin-menu-bar";
import {Router} from "@vaadin/router";

import {localized, msg} from '@lit/localize';
import {setLocale} from "Frontend/index";

@localized()
@customElement('editor-xform-toolbar-panel')
export class EditorXformToolbarPanel extends MobxLitElement {

  @query('#main_menu')
  private mainMenu!: MenuBarElement;

  @query('#add_menu')
  private addMenu!: HTMLElement;

  @query('#add_transform_itm')
  private addTransformItm!: HTMLElement;

  @query('#add_linked_transform_itm')
  private addLinkedTransformItm!: HTMLElement;

  @query('#add_final_transform_itm')
  private addfinalTransformItm!: HTMLElement;

  @query('#edit_menu')
  private editMenu!: HTMLElement;

  @query('#edit_delete_transform_itm')
  private editDeleteTransformItm!: HTMLElement;

  @query('#edit_duplicate_transform_itm')
  private editDuplicateTransformItm!: HTMLElement;

  @query('#edit_transform_name_itm')
  private editTransformNameItm!: HTMLElement;

  @property()
  onAddTransform = ()=> {}

  @property()
  onAddLinkedTransform = ()=> {}

  @property()
  onAddFinalTransform = ()=> {}

  @property()
  onEditDeleteTransform = ()=> {}

  @property()
  onEditDuplicateTransform = ()=> {}

  @property()
  onEditTransformName = ()=> {}

  // Icons: https://vaadin.com/docs/latest/ds/foundation/icons/vaadin
  render() {
    return html`
         <vaadin-menu-bar id="main_menu"></vaadin-menu-bar>
          <div style="display: none";>
            <vaadin-item id="add_menu"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:plus-circle"></vaadin-icon>${msg('Add')}</vaadin-item>
            <vaadin-item @click="${this.onAddTransform}" id="add_transform_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:function"></vaadin-icon>${msg('Add transform')}</vaadin-item>
            <vaadin-item @click="${this.onAddLinkedTransform}" id="add_linked_transform_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:link"></vaadin-icon>${msg('Add linked transform')}</vaadin-item>
            <vaadin-item @click="${this.onAddFinalTransform}" id="add_final_transform_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:viewport"></vaadin-icon>${msg('Add final transform')}</vaadin-item>

            <vaadin-item id="edit_menu"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:edit"></vaadin-icon>${msg('Edit')}</vaadin-item>
            <vaadin-item @click="${this.onEditDeleteTransform}" id="edit_delete_transform_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:minus-circle-o"></vaadin-icon>${msg('Delete transform')}</vaadin-item>
            <vaadin-item @click="${this.onEditDuplicateTransform}" id="edit_duplicate_transform_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:copy-o"></vaadin-icon>${msg('Duplicate transform')}</vaadin-item>
            <vaadin-item @click="${this.onEditTransformName}" id="edit_transform_name_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:comment-ellipsis-o"></vaadin-icon>${msg('Edit transform name')}</vaadin-item>
          </div>
     `;
  }


  async firstUpdated() {
    let menuItems = [
      {
        component: this.addMenu,
        children: [
          {component: this.addTransformItm},
          {component: this.addLinkedTransformItm},
          {component: this.addfinalTransformItm}
        ]
      },
      {
        component: this.editMenu,
        children: [
          {component: this.editDeleteTransformItm},
          {component: this.editDuplicateTransformItm},
          {component: this.editTransformNameItm}
        ]
      },
    ];
    this.mainMenu.items = menuItems;
  }

}
