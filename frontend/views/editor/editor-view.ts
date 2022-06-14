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

import {html} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import { View } from '../../views/view'

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

import {FlameRenderer} from '../../flames/renderer/flame-renderer'
import {FlamesEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from '../../flames/model/mapper/flame-mapper'
import '@vaadin/vaadin-combo-box';
import {PlaygroundRenderPanel} from "Frontend/views/playground/playground-render-panel";
import {PlaygroundFlamePanel} from "Frontend/views/playground/playground-flame-panel";
import '../../components/swan-loading-indicator'
import '../../components/swan-error-panel'
import '../../components/render-panel'
import '../../components/swan-notification-panel'
import {BeforeEnterObserver, PreventAndRedirectCommands, Router, RouterLocation} from "@vaadin/router";
import {RenderPanel} from "Frontend/components/render-panel";

import './editor-toolbar-panel'
import {editorStore} from "Frontend/stores/editor-store";
import {SwanNotificationPanel} from "Frontend/components/swan-notification-panel";
import {DisplayMode} from "Frontend/flames/renderer/render-settings";
import {localized, msg} from "@lit/localize";
import {Flame} from "Frontend/flames/model/flame";

@localized()
@customElement('editor-view')
export class EditorView extends View implements BeforeEnterObserver {
    @state()
    selectedTab = 0

    @state()
    renderInfo = ''

    @state()
    notificationMessage = ''

    @query('swan-notification-panel')
    notificationPnl!: SwanNotificationPanel

    render() {
        return html`
          <swan-notification-panel></swan-notification-panel>
          <header>
            <editor-toolbar-panel 
              .onEditPasteFlameFromClipboard="${this.importParamsFromClipboard}"
              .onEditCopyFlameToClipboard="${this.exportParamsToClipboard}"
              .onNewBlankFlame="${this.createBlankFlame}"
              .onNewRandomFlame="${this.createRandomFlame}"
              .onNewRandomGradient="${this.createRandomGradient}"
            ></editor-toolbar-panel>
          </header>           
          <main>
            <swan-error-panel .errorMessage=${editorStore.lastError}></swan-error-panel>
            <vertical-layout>
              <div class="gap-m grid list-none m-0 p-0" style="grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));">
                <render-panel .onCreateFlameRenderer=${this.createFlameRenderer}></render-panel> 
                ${this.renderMainTabs()}
              </div>
              </vertical-layout>
          </main>
        `;
    }

    createFlameRenderer = ()=> {
        return new FlameRenderer(512, 256,
          DisplayMode.FLAME, this.getRenderPanel().canvas,
          undefined, false,
          '',
          undefined, 1.5,
          editorStore.flame)
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

    exportParamsToClipboard = (): void => {
        FlamesEndpoint.convertFlameToXml(FlameMapper.mapToBackend(editorStore.flame)).then(flameXml => {
            navigator.clipboard.writeText(flameXml)
            this.notificationPnl.showNotifivation(msg('Parameters were copied to the Clipboard'))
        })
          .catch(err=> {
              editorStore.lastError = err
          })
    }

    importParamsFromClipboard = (): void => {
       navigator.clipboard.readText().then(text => {
           editorStore.calculating = true
           editorStore.lastError = ''
           FlamesEndpoint.parseFlame(text).then(flame => {
               editorStore.refreshing = true
               try {
                   editorStore.flame = FlameMapper.mapFromBackend(flame)
                   this.getRenderPanel().rerenderFlame()
                   editorStore.calculating = false
               }
               finally {
                   editorStore.refreshing = false
               }
           }).catch(err=> {
               editorStore.calculating = false
               editorStore.lastError = err
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

    getRenderPanel = (): RenderPanel =>  {
        return document.querySelector('render-panel')!
    }

    createBlankFlame = () => {
        editorStore.calculating = true
        editorStore.lastError = ''

        FlamesEndpoint.generateRandomFlame(editorStore.variations).then(
          randomFlame => {
              editorStore.refreshing = true
              try {
                  editorStore.flame = new Flame()
                  this.getRenderPanel().rerenderFlame()
                  editorStore.calculating = false
              }
              finally {
                  editorStore.refreshing = false
              }
          }
        ).catch(err=> {
            editorStore.calculating = false
            editorStore.lastError = err
        })
    }

    createRandomFlame = () => {
        editorStore.calculating = true
        editorStore.lastError = ''

        FlamesEndpoint.generateRandomFlame(editorStore.variations).then(
          randomFlame => {
              editorStore.refreshing = true
              try {
                  editorStore.flame = FlameMapper.mapFromBackend(randomFlame.flame)
                  this.getRenderPanel().rerenderFlame()
                  editorStore.calculating = false
              }
              finally {
                  editorStore.refreshing = false
              }
          }
        ).catch(err=> {
            editorStore.calculating = false
            editorStore.lastError = err
        })
    }

    createRandomGradient = () => {
        editorStore.calculating = true
        editorStore.lastError = ''

        FlamesEndpoint.generateRandomGradientForFlame(FlameMapper.mapToBackend(editorStore.flame)).then(
          randomFlame => {
              editorStore.refreshing = true
              try {
                  editorStore.flame = FlameMapper.mapFromBackend(randomFlame.flame)
                  this.getRenderPanel().rerenderFlame()
                  editorStore.calculating = false
              }
              finally {
                  editorStore.refreshing = false
              }
          }
        ).catch(err=> {
            editorStore.calculating = false
            editorStore.lastError = err
        })
    }

}