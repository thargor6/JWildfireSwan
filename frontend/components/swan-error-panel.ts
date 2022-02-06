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

import {customElement, property} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";
import {css, html, nothing} from "lit";
import '@vaadin/vaadin-details'
import '@vaadin/text-area';
import {playgroundStore} from "Frontend/stores/playground-store";

@customElement('swan-error-panel')
export class SwanErrorPanel extends MobxLitElement {

    @property()
    errorMessage = ''

    render() {
        return this.errorMessage==='' ? nothing: html  `
            <vaadin-details opened>
                <vaadin-horizontal-layout
                        slot="summary"
                        style="justify-content: space-between; width: 100%;"
                >
                    <vaadin-horizontal-layout
                            style="color: var(--lumo-error-text-color); margin-left: var(--lumo-space-s)"
                    >
                        <vaadin-icon
                                icon="vaadin:exclamation-circle"
                                style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"
                        ></vaadin-icon>
                        <span>An error has occured!</span>
                    </vaadin-horizontal-layout>
                </vaadin-horizontal-layout>

                <vaadin-text-area style="max-width:100em; max-height: 16em;" label="Message" value="${playgroundStore.lastError}"></vaadin-text-area>


            </vaadin-details>
        `
    }
}