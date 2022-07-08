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
@customElement('editor-toolbar-panel')
export class EditorToolbarPanel extends MobxLitElement {

  @query('#main_menu')
  private mainMenu!: MenuBarElement

  @query('#file_menu')
  private fileMenu!: HTMLElement

  @query('#file_open_itm')
  private fileOpenItm!: HTMLElement

  @query('#file_save_itm')
  private fileSaveItm!: HTMLElement

  @query('#new_menu')
  private newMenu!: HTMLElement

  @query('#new_blank_flame_itm')
  private newBlankFlameItm!: HTMLElement

  @query('#new_random_flame_itm')
  private newRandomFlameItm!: HTMLElement

  @query('#new_random_gradient_itm')
  private newRandomGradientItm!: HTMLElement

  @query('#edit_menu')
  private editMenu!: HTMLElement

  @query('#edit_copy_flame_to_clipboard_itm')
  private editCopyFlameToClipboardItm!: HTMLElement

  @query('#edit_paste_flame_from_clipboard_itm')
  private editPasteFlameFromClipboardItm!: HTMLElement

  @query('#edit_undo_itm')
  private editUndoItm!: HTMLElement

  @query('#edit_redo_itm')
  private editRedoItm!: HTMLElement

  @query('#tools_menu')
  private toolsMenu!: HTMLElement;

  @query('#tools_send_to_renderer_itm')
  private toolsSendToRendererItm!: HTMLElement

  @property()
  onOpenFile = ()=> {}

  @property()
  onSaveFile = ()=> {}

  @property()
  onNewBlankFlame = ()=> {}

  @property()
  onNewRandomFlame = ()=> {}

  @property()
  onNewRandomGradient = ()=> {}

  @property()
  onEditCopyFlameToClipboard = ()=> {}

  @property()
  onEditPasteFlameFromClipboard = ()=> {}

  @property()
  onEditUndo = ()=> {}

  @property()
  onEditRedo = ()=> {}

  @property()
  onToolsSendToRenderer = ()=> {}

  // Icons: https://vaadin.com/docs/latest/ds/foundation/icons/vaadin
  render() {
    return html`
         <vaadin-menu-bar id="main_menu"></vaadin-menu-bar>
          <div style="display: none";>
            <vaadin-item id="file_menu"><vaadin-icon class="menu_icon" style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:folder-o"></vaadin-icon>${msg('File')}</vaadin-item>
            <vaadin-item @click="${this.onOpenFile}" id="file_open_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:folder-open-o"></vaadin-icon>${msg('Open file')}</vaadin-item>
            <vaadin-item @click="${this.onSaveFile}" id="file_save_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:disc"></vaadin-icon>${msg('Save file')}</vaadin-item>

            <vaadin-item id="new_menu"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:plus-circle"></vaadin-icon>${msg('New')}</vaadin-item>
            <vaadin-item @click="${this.onNewBlankFlame}" id="new_blank_flame_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:thin-square"></vaadin-icon>${msg('New blank flame')}</vaadin-item>
            <vaadin-item @click="${this.onNewRandomFlame}" id="new_random_flame_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:magic"></vaadin-icon>${msg('New random flame')}</vaadin-item>
            <vaadin-item @click="${this.onNewRandomGradient}" id="new_random_gradient_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:palette"></vaadin-icon>${msg('New random gradient')}</vaadin-item>

            <vaadin-item id="edit_menu"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:edit"></vaadin-icon>${msg('Edit')}</vaadin-item>
            <vaadin-item @click="${this.onEditCopyFlameToClipboard}" id="edit_copy_flame_to_clipboard_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:copy-o"></vaadin-icon>${msg('Copy flame to clipboard')}</vaadin-item>
            <vaadin-item @click="${this.onEditPasteFlameFromClipboard}" id="edit_paste_flame_from_clipboard_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:paste"></vaadin-icon>${msg('Paste flame from clipboard')}</vaadin-item>
            <vaadin-item @click="${this.onEditUndo}" id="edit_undo_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:arrow-backward"></vaadin-icon>${msg('Undo')}</vaadin-item>
            <vaadin-item @click="${this.onEditRedo}" id="edit_redo_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:arrow-forward"></vaadin-icon>${msg('Redo')}</vaadin-item>

            <vaadin-item id="tools_menu"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:wrench"></vaadin-icon>${msg('Tools')}</vaadin-item>
            <vaadin-item @click="${this.onToolsSendToRenderer}" id="tools_send_to_renderer_itm"><vaadin-icon style="padding-right: 0.5em; width: 1.6em;" icon="vaadin:picture"></vaadin-icon>${msg('Send to renderer')}</vaadin-item>
 
          </div>
`;
  }


  async firstUpdated() {
    let menuItems = [

      {
        component: this.fileMenu,
        children: [
          {component: this.fileOpenItm},
          {component: this.fileSaveItm},
        ]
      },
      {
        component: this.newMenu,
        children: [
          {component: this.newBlankFlameItm},
          {component: this.newRandomFlameItm},
          {component: this.newRandomGradientItm},
        ]
      },
      {
        component: this.editMenu,
        children: [
          {component: this.editCopyFlameToClipboardItm},
          {component: this.editPasteFlameFromClipboardItm},
          {component: this.editUndoItm},
          {component: this.editRedoItm},
        ]
      },
      {
        component: this.toolsMenu,
        children: [
          {component: this.toolsSendToRendererItm},
        ]
      },
    ];
    this.mainMenu.items = menuItems;
  }

}

/*
         <vaadin-button @click="${()=>{


             (async () => {
                 await setLocale('en');
             })();


         }}">Switch language</vaadin-button>
 */
