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

import {css, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";
import '@vaadin/vaadin-grid'

import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import {localized, msg} from '@lit/localize';
import {undoHistoryInfoStore, UndoHistoryItem} from "Frontend/views/editor/editor-undo-history-dialog-store";
import {GridActiveItemChangedEvent} from "@vaadin/grid";

@localized()
@customElement('editor-undo-history-dialog-content')
export class EditorUndoHistoryDialogContent extends MobxLitElement {

  render() {
    return html`
        <vaadin-grid style="min-width: 40em;"
                .items="${undoHistoryInfoStore.items}"
                .selectedItems="${undoHistoryInfoStore.selectedItems}"
                @active-item-changed="${(e: GridActiveItemChangedEvent<UndoHistoryItem>) => {
                    const item = e.detail.value;
                    undoHistoryInfoStore.selectedItems = item ? [item] : [];
                }}"
        >
            <vaadin-grid-column path="caption"></vaadin-grid-column>
        </vaadin-grid>
    `;
  }

}
