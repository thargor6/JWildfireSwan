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
@customElement('single-renderer-toolbar-panel')
export class SingleRendererToolbarPanel extends MobxLitElement {

  @query('#main_menu')
  private mainMenu!: MenuBarElement;

  @query('#edit_menu')
  private editMenu!: HTMLElement;

  @query('#edit_paste_flame_from_clipboard_itm')
  private editPasteFlameFromClipboardItm!: HTMLElement;

  @property()
  onEditPasteFlameFromClipboard = ()=> {}

  render() {
    return html`
         <vaadin-menu-bar id="main_menu"></vaadin-menu-bar>
          <div style="display: none";>
            <vaadin-item id="edit_menu"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:plus-circle"></vaadin-icon>${msg('Edit')}</vaadin-item>
              <vaadin-item @click="${this.onEditPasteFlameFromClipboard}" id="edit_paste_flame_from_clipboard_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:paste"></vaadin-icon>${msg('Paste flame from clipboard')}</vaadin-item>
          </div>
`;
  }


  async firstUpdated() {
    let menuItems = [
      {
        component: this.editMenu,
        children: [
          {component: this.editPasteFlameFromClipboardItm},
        ]
      },
    ];
    this.mainMenu.items = menuItems;
  }

}
