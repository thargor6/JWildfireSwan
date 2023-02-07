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

import {customElement, property, query} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";
import {html, render} from "lit";
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout';
import '@vaadin/icon'
import '@vaadin/vaadin-button'
import '@vaadin/notification'
import {Notification} from "@vaadin/notification";
import {guard} from "lit/directives/guard.js";

@customElement('swan-notification-panel')
export class SwanNotificationPanel extends MobxLitElement {

    @property()
    notificationMessage = ''

    @query('vaadin-notification')
    notification!: Notification

    render() {
        return html `<vaadin-notification
          .renderer="${guard([], () => (root: HTMLElement) => {
            render(
              html`
        <vaadin-horizontal-layout theme="spacing" style="align-items: center">
          <vaadin-icon
            icon="vaadin:check-circle"
            style="color: var(--lumo-success-color)"
          ></vaadin-icon>
          <div>
            <b style="color: var(--lumo-success-text-color);">Export successful</b>
            <div
              style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color)"
            >
              ${this.notificationMessage}
            </div>
          </div>
          <vaadin-button
            theme="tertiary-inline"
            @click="${this.closeNotification.bind(this)}"
            aria-label="Close"
          >
            <vaadin-icon icon="lumo:cross"></vaadin-icon>
          </vaadin-button>
        </vaadin-horizontal-layout>
      `,
              root
            );
        })}"
          position="middle" duration="600"
        ></vaadin-notification>`
    }

    openNotification() {
        this.notification?.open();
    }

    closeNotification() {
        this.notification?.close();
    }

    showNotifivation(message: string) {
         this.notificationMessage = message
        this.openNotification()
    }

}