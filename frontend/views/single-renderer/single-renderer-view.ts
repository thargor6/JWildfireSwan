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
import '@vaadin/app-layout/vaadin-drawer-toggle';

import {FlameRenderer} from '../../flames/renderer/flame-renderer'
import {FlamesEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from '../../flames/model/mapper/flame-mapper'
import '@vaadin/vaadin-combo-box';
import './single-renderer-render-panel'
import {SingleRendererRenderPanel} from "Frontend/views/single-renderer/single-renderer-render-panel";
import '../../components/swan-loading-indicator'
import '../../components/swan-error-panel'
import '../../components/swan-notification-panel'
import '../../components/swan-render-panel'
import './single-renderer-toolbar-panel'
import {SwanRenderPanel} from "Frontend/components/swan-render-panel";
import {RenderResolutions} from "Frontend/flames/renderer/render-resolution";
import {msg, localized} from "@lit/localize";
import {singleRendererStore} from "Frontend/stores/single-renderer-store";
import {BeforeEnterObserver, PreventAndRedirectCommands, Router, RouterLocation} from "@vaadin/router";

@localized()
@customElement('single-renderer-view')
export class SingleRendererView extends View implements BeforeEnterObserver {
    @state()
    selectedTab = 0

    @state()
    renderInfo = ''

    @state()
    notificationMessage = ''

    doInitialRefresh = false

    loadExampleAtStartup: string | undefined = undefined
    loadRndFlameAtStartup: string | undefined = undefined

    render() {
        return html`
            <header class="bg-base border-b border-contrast-10 box-border flex h-xl items-center w-full" slot="navbar">
                <vaadin-drawer-toggle aria-label="Menu toggle" class="text-secondary"
                                      theme="contrast"></vaadin-drawer-toggle>
                <h1 class="m-0 text-l">${msg('Flame renderer')}</h1>
                <single-renderer-toolbar-panel
                  .onEditPasteFlameFromClipboard="${this.importParamsFromClipboard}"
                ></single-renderer-toolbar-panel>
            </header>

            <vertical-layout theme="spacing">
                <swan-error-panel .errorMessage=${singleRendererStore.lastError}></swan-error-panel>
                <swan-notification-panel></swan-notification-panel>
                <div class="gap-m grid list-none m-0 p-0"
                     style="grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));">
                    <swan-render-panel
                      .containerWidth="${'44em'}" .containerHeight="${'44em'}"
                      .canvasDisplayWidth="${'40em'}" .canvasDisplayHeight="${'40em'}"
                      .onCreateFlameRenderer=${this.createFlameRenderer}></swan-render-panel>
                    <single-renderer-render-panel id='viewOptsPnl'
                                                  .onCancelRender="${() => this.getRenderPanel().cancelRender()}"
                                                  .onRender="${() => this.getRenderPanel().rerenderFlame()}"
                                                  .onImageSizeChanged="${() => this.getRenderPanel().rerenderFlame()}"></single-renderer-render-panel>

                </div>
            </vertical-layout>
        `;
    }

    createFlameRenderer = () => {
        return new FlameRenderer(singleRendererStore.sharedRenderCtx,
          this.getRenderSettingsPanel().renderSize, this.getRenderSettingsPanel().swarmSize,
          this.getRenderSettingsPanel().displayMode, this.getRenderPanel().canvas,
          this.getRenderSettingsPanel().capturedImageContainer, true,
          '',
          RenderResolutions.getCropRegion(this.getRenderSettingsPanel().renderSize,
            this.getRenderSettingsPanel().cropSize), this.getRenderSettingsPanel().qualityScale,
          false, singleRendererStore.flame)
    }

    selectedChanged(e: CustomEvent) {
        this.selectedTab = e.detail.value;
    }

    getRenderSettingsPanel = (): SingleRendererRenderPanel => {
        return document.querySelector('#viewOptsPnl')!
    }

    importParamsFromClipboard = (): void => {
        navigator.clipboard.readText().then(text => {
              singleRendererStore.calculating = true
              singleRendererStore.lastError = ''
              FlamesEndpoint.parseFlame(text).then(flame => {
                  singleRendererStore.refreshing = true
                  try {
                      singleRendererStore.flame = FlameMapper.mapFromBackend(flame)
                      this.getRenderPanel().rerenderFlame()
                      singleRendererStore.calculating = false
                  } finally {
                      singleRendererStore.refreshing = false
                  }
              }).catch(err => {
                  singleRendererStore.calculating = false
                  singleRendererStore.lastError = err
              })

          }
        )
    }

    getRenderPanel = (): SwanRenderPanel => {
        return document.querySelector('swan-render-panel')!
    }

    onBeforeEnter(
      _location: RouterLocation,
      _commands: PreventAndRedirectCommands,
      _router: Router) {
        if(singleRendererStore.flame.layers.length>0 && _location.search.indexOf('refresh')) {
            this.doInitialRefresh = true
        }
        else {
            this.doInitialRefresh = false
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties)
        if(this.doInitialRefresh) {
            this.doInitialRefresh = false
            setTimeout( ()=>this.getRenderPanel().rerenderFlame(), 250)
        }
    }
}