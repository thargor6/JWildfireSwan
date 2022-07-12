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
import {MobxLitElement} from "@adobe/lit-mobx";

import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-dialog';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import '@vaadin/tabs'

import {localized, msg} from '@lit/localize';
import {guard} from "lit/directives/guard.js";
import {Dialog} from "@vaadin/dialog";
import {IReactionDisposer} from "mobx";

import './editor-undo-history-dialog-content'
import {undoHistoryInfoStore} from "Frontend/views/editor/editor-undo-history-dialog-store";

@localized()
@customElement('editor-undo-history-dialog')
export class EditorUndoHistoryDialog extends MobxLitElement {
  @state()
  dialogOpened = false

  @query('vaadin-dialog')
  dialog!: Dialog

  private disposer: IReactionDisposer | undefined = undefined

  render() {
    return html`
      <vaadin-dialog
        header-title="${msg('Undo history')}"
        resizable draggable
        .opened="${this.dialogOpened}"
        @opened-changed="${(e: CustomEvent) => (this.dialogOpened = e.detail.value)}"
        .footerRenderer="${guard([], () => (root: HTMLElement) => {
      render(this.footerLayout, root);
    })}"
        .renderer="${guard([], () => (root: HTMLElement) => {
      render(this.dialogLayout(), root);
    })}"
      ></vaadin-dialog>
    `;
  }

  dialogLayout = ()=> html`<editor-undo-history-dialog-content></editor-undo-history-dialog-content>`

  footerLayout = html`
    <vaadin-button @click="${() => {this.dialogOpened = false}}">${msg('Close')}</vaadin-button>
  `;

  public refreshHistory() {
    undoHistoryInfoStore.registerRefresh(this.dialog)
    undoHistoryInfoStore.refreshUndoHistory()
  }

}
