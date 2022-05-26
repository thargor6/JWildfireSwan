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

import {html, PropertyValues, render} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import { View } from '../../views/view'
import { guard } from 'lit/directives/guard.js';

import '@vaadin/vaadin-button'
import '@vaadin/vaadin-text-field'
import '@vaadin/dialog'
import '@vaadin/horizontal-layout'
import '@vaadin/text-area'
import '@vaadin/text-field'
import '@vaadin/vertical-layout'
import '@vaadin/icon'
import '@vaadin/icons'
import '@vaadin/tabs'
import '@vaadin/vaadin-progress-bar'
import '@vaadin/scroller'
import '@vaadin/split-layout';
import '@vaadin/vaadin-notification'
import type { Notification } from '@vaadin/notification';

import {FlameRenderer} from '../../flames/renderer/flame-renderer'
import {FlamesEndpoint, GalleryEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from '../../flames/model/mapper/flame-mapper'
import '@vaadin/vaadin-combo-box';
import {PlaygroundRenderPanel} from "Frontend/views/playground/playground-render-panel";
import {playgroundStore} from "Frontend/stores/playground-store";
import {PlaygroundFlamePanel} from "Frontend/views/playground/playground-flame-panel";
import '../../components/swan-loading-indicator'
import '../../components/swan-error-panel'
import '../../components/render-panel'
import {BeforeEnterObserver, PreventAndRedirectCommands, Router, RouterLocation} from "@vaadin/router";
import {RenderPanel} from "Frontend/components/render-panel";
import {RenderResolutions} from "Frontend/flames/renderer/render-resolution";

@customElement('editor-view')
export class EditorView extends View implements BeforeEnterObserver {
    @state()
    selectedTab = 0

    @state()
    renderInfo = ''

    @state()
    notificationMessage = ''


    render() {
        return html`
            ${this.renderNotification()}
            <vertical-layout theme="spacing">
              <swan-error-panel .errorMessage=${playgroundStore.lastError}></swan-error-panel>
              <div class="gap-m grid list-none m-0 p-0" style="grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));">
                <render-panel .onCreateFlameRenderer=${this.createFlameRenderer}></render-panel> 
                ${this.renderMainTabs()}
              </div>  
            </vertical-layout>
        `;
    }

    createFlameRenderer = ()=> {
        return new FlameRenderer(this.getRenderSettingsPanel().renderSize, this.getRenderSettingsPanel().swarmSize,
           this.getRenderSettingsPanel().displayMode, this.getRenderPanel().canvas,
          this.getRenderSettingsPanel().capturedImageContainer, true,
          '',
          RenderResolutions.getCropRegion(this.getRenderSettingsPanel().renderSize,
            this.getRenderSettingsPanel().cropSize), this.getRenderSettingsPanel().qualityScale,
          playgroundStore.flame)
    }

    selectedChanged(e: CustomEvent) {
        this.selectedTab = e.detail.value;
    }

    getFlamePanel = (): PlaygroundFlamePanel => {
        return document.querySelector('#flamePnl')!
    }

    getRenderSettingsPanel = (): PlaygroundRenderPanel => {
        return document.querySelector('#viewOptsPnl')!
    }

    importFlameFromXml = () => {
        playgroundStore.calculating = true
        playgroundStore.lastError = ''
        FlamesEndpoint.parseFlame(this.getFlamePanel().flameXml).then(flame => {
          playgroundStore.refreshing = true
          try {
              playgroundStore.flame = FlameMapper.mapFromBackend(flame)
              this.getRenderPanel().rerenderFlame()
              playgroundStore.calculating = false
          }
          finally {
              playgroundStore.refreshing = false
          }
        }).catch(err=> {
            playgroundStore.calculating = false
            playgroundStore.lastError = err
        })
    }


    exportParamsToClipboard = (): void => {
        FlamesEndpoint.convertFlameToXml(FlameMapper.mapToBackend(playgroundStore.flame)).then(flameXml => {
            this.getFlamePanel().flameXml = flameXml
            this.getFlamePanel().transferFlameToClipbord()
            this.notificationMessage = 'Parameters were copied to the Clipboard'
            this.openNotification(1)
        })
          .catch(err=> {
              playgroundStore.lastError = err
          })
    }

    importParamsFromClipboard = (): void => {
       navigator.clipboard.readText().then(text => {
           this.getFlamePanel().flameXml = text
           playgroundStore.calculating = true
           playgroundStore.lastError = ''
           FlamesEndpoint.parseFlame(text).then(flame => {
               playgroundStore.refreshing = true
               try {
                   playgroundStore.flame = FlameMapper.mapFromBackend(flame)
                   this.getRenderPanel().rerenderFlame()
                   playgroundStore.calculating = false
               }
               finally {
                   playgroundStore.refreshing = false
               }
           }).catch(err=> {
               playgroundStore.calculating = false
               playgroundStore.lastError = err
           })

         }
       )
    }

    onBeforeEnter(
        _location: RouterLocation,
        _commands: PreventAndRedirectCommands,
        _router: Router) {
        /*
        this.loadExampleAtStartup = ''
        this.loadRndFlameAtStartup = ''

        const exampleName = _location.params['example'] as string;
        if(exampleName && exampleName!=='') {
            this.loadExampleAtStartup = exampleName
        }

        const rndFlameName = _location.params['rndFlameName'] as string;
        if(rndFlameName && rndFlameName!=='') {
            const parentRndFlameName = _location.params['parentRndFlameName'] as string;
            if(parentRndFlameName && parentRndFlameName.length>0) {
                this.loadRndFlameAtStartup = `${parentRndFlameName}/${rndFlameName}`
            }
            else {
                this.loadRndFlameAtStartup = rndFlameName
            }
        }
         */
    }

    private renderMainTabs = () => {
        return html `
           <div style="display: flex; flex-direction: column; padding: 1em;">
                <vaadin-tabs theme="centered" @selected-changed="${this.selectedChanged}">
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:fire"></vaadin-icon>
                        <span>Flame</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>Render</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>Edit</span>
                    </vaadin-tab>
                </vaadin-tabs>
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
   Panels...
                 </div>
           </div>`
    }

    private renderNotification() {
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
            @click="${this.closeNotification.bind(this, 1)}"
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

    openNotification(which: number) {
        const notification = this.querySelector(
          `vaadin-notification:nth-child(${which})`
        ) as Notification;
        notification?.open();
    }

    closeNotification(which: number) {
        const notification = this.querySelector(
          `vaadin-notification:nth-child(${which})`
        ) as Notification;
        notification?.close();
    }

    getRenderPanel = (): RenderPanel =>  {
        return document.querySelector('render-panel')!
    }

}