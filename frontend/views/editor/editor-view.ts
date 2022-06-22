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
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/text-area'
import '@vaadin/text-field'
import '@vaadin/icon'
import '@vaadin/icons'
import '@vaadin/tabs'
import '@vaadin/vaadin-progress-bar'
import '@vaadin/scroller'
import '@vaadin/split-layout';
import '@vaadin/vaadin-notification'
import '@vaadin/vaadin-grid'
import '@vaadin/vaadin-split-layout'

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
import '../../components/swan-number-slider'
import {BeforeEnterObserver, PreventAndRedirectCommands, Router, RouterLocation} from "@vaadin/router";
import {RenderPanel} from "Frontend/components/render-panel";

import './editor-toolbar-panel'
import {editorStore} from "Frontend/stores/editor-store";
import {SwanNotificationPanel} from "Frontend/components/swan-notification-panel";
import {DisplayMode} from "Frontend/flames/renderer/render-settings";
import {localized, msg} from "@lit/localize";
import {Flame} from "Frontend/flames/model/flame";

import './editor-edit-camera-panel'
import './editor-edit-coloring-panel'
import './editor-edit-denoiser-panel'
import './editor-edit-motion-panel'
import './editor-edit-layers-panel'
import './editor-edit-xform-affine-panel'
import './editor-edit-xform-nonlinear-panel'
import './editor-edit-xform-xaos-panel'
import './editor-edit-xform-color-panel'
import {EditorEditCameraPanel} from "Frontend/views/editor/editor-edit-camera-panel";
import {EditorEditColoringPanel} from "Frontend/views/editor/editor-edit-coloring-panel";
import {EditorEditDenoiserPanel} from "Frontend/views/editor/editor-edit-denoiser-panel";
import {EditorEditMotionPanel} from "Frontend/views/editor/editor-edit-motion-panel";
import {EditorEditLayersPanel} from "Frontend/views/editor/editor-edit-layers-panel";
import {EditorEditXformAffinePanel} from "Frontend/views/editor/editor-edit-xform-affine-panel";
import {EditorEditXformNonlinearPanel} from "Frontend/views/editor/editor-edit-xform-nonlinear-panel";
import {EditorEditXformXaosPanel} from "Frontend/views/editor/editor-edit-xform-xaos-panel";
import {EditorEditXformColorPanel} from "Frontend/views/editor/editor-edit-xform-color-panel";

@localized()
@customElement('editor-view')
export class EditorView extends View implements BeforeEnterObserver {
  @state()
  selectedFlameTab = 0

  @state()
  selectedTransformTab = 0

  @state()
  renderInfo = ''

  @state()
  notificationMessage = ''

  @query('swan-notification-panel')
  notificationPnl!: SwanNotificationPanel

  @query('editor-edit-camera-panel')
  flameCameraPanel!: EditorEditCameraPanel

  @query('editor-edit-coloring-panel')
  flameColoringPanel!: EditorEditColoringPanel

  @query('editor-edit-denoiser-panel')
  flameDenoiserPanel!: EditorEditDenoiserPanel

  @query('editor-edit-motion-panel')
  flameMotionPanel!: EditorEditMotionPanel

  @query('editor-edit-layers-panel')
  flameLayersPanel!: EditorEditLayersPanel

  @query('editor-edit-xform-affine-panel')
  xformAffinePanel!: EditorEditXformAffinePanel

  @query('editor-edit-xform-nonlinear-panel')
  xformNonlinearPanel!: EditorEditXformNonlinearPanel

  @query('editor-edit-xform-xaos-panel')
  xformXaosPanel!: EditorEditXformXaosPanel

  @query('editor-edit-xform-color-panel')
  xformColorPanel!: EditorEditXformColorPanel

  render() {
        return html`
          <swan-notification-panel></swan-notification-panel>
          <swan-error-panel .errorMessage=${editorStore.lastError}></swan-error-panel>
          <vertical-layout>
            <div class=" grid list-none m-0 p-0" style="grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));">
              <render-panel .onCreateFlameRenderer=${this.createFlameRenderer}></render-panel>
                <vaadin-split-layout>
                  <vertical-layout style="width: 33%;">
                    <h2>${msg('Transformations')}</h2>
                    <vaadin-grid theme="compact" .items="${editorStore.currXforms}">
                      <vaadin-grid-column path="weight"></vaadin-grid-column>
                      <vaadin-grid-column path="color"></vaadin-grid-column>
                    </vaadin-grid>
                  </vertical-layout>
                  <vertical-layout>
                    <editor-toolbar-panel 
                      .onEditPasteFlameFromClipboard="${this.importParamsFromClipboard}"
                      .onEditCopyFlameToClipboard="${this.exportParamsToClipboard}"
                      .onNewBlankFlame="${this.createBlankFlame}"
                      .onNewRandomFlame="${this.createRandomFlame}"
                      .onNewRandomGradient="${this.createRandomGradient}"
                    ></editor-toolbar-panel>
                    ${this.renderTransformTabs()}
                  </vertical-layout>
              </vaadin-split-layout>
            </div>
            ${this.renderFlameTabs()}
          </vertical-layout>
        `;
    }

    createFlameRenderer = ()=> {
        return new FlameRenderer(512, 256,
          DisplayMode.FLAME, this.getRenderPanel().canvas,
          undefined, false,
          '',
          undefined, 1.5,
          this.currFlame)
    }

    selectedFlameTabChanged(e: CustomEvent) {
        this.selectedFlameTab = e.detail.value;
    }

  selectedTransformTabChanged(e: CustomEvent) {
    this.selectedTransformTab = e.detail.value;
  }

    getFlamePanel = (): PlaygroundFlamePanel => {
        return document.querySelector('#flamePnl')!
    }

    getRenderSettingsPanel = (): PlaygroundRenderPanel => {
        return document.querySelector('#viewOptsPnl')!
    }

    exportParamsToClipboard = (): void => {
        FlamesEndpoint.convertFlameToXml(FlameMapper.mapToBackend(this.currFlame)).then(flameXml => {
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
                 this.currFlame = FlameMapper.mapFromBackend(flame)
                   this.getRenderPanel().rerenderFlame()
                   editorStore.calculating = false
               }
               finally {
                   editorStore.refreshing = false
               }
           }).catch(err=> {
             console.log('ERROR', err)
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

    private renderFlameTabs = () => {
        return html `
           <div style="display: flex; flex-direction: column; padding: 1em;">
                <vaadin-tabs @selected-changed="${this.selectedFlameTabChanged}">
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:fire"></vaadin-icon>
                        <span>${msg('Camera')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>${msg('Coloring')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>${msg('Denoiser')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>${msg('Motion')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>${msg('Layers')}</span>
                    </vaadin-tab>
                </vaadin-tabs>
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                    <editor-edit-camera-panel .visible=${this.selectedFlameTab === 0}
                     .afterPropertyChange=${this.rerender}></editor-edit-camera-panel>
                    <editor-edit-coloring-panel .visible=${this.selectedFlameTab === 1}
                      .afterPropertyChange=${this.rerender}></editor-edit-coloring-panel>
                    <editor-edit-denoiser-panel .visible=${this.selectedFlameTab === 2}
                      .afterPropertyChange=${this.rerender}></editor-edit-denoiser-panel>
                    <editor-edit-motion-panel .visible=${this.selectedFlameTab === 3}
                      .afterPropertyChange=${this.rerender}></editor-edit-motion-panel>
                    <editor-edit-layers-panel .visible=${this.selectedFlameTab === 4}
                      .afterPropertyChange=${this.rerender}></editor-edit-layers-panel>
                 </div>
           </div>`
    }

  private renderTransformTabs = () => {
    return html `
           <div style="display: flex; flex-direction: column; padding: 1em;">
                <vaadin-tabs @selected-changed="${this.selectedTransformTabChanged}">
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:fire"></vaadin-icon>
                        <span>${msg('Affine')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>${msg('Nonlinear')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>${msg('Xaos')}</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>${msg('Color')}</span>
                    </vaadin-tab>
                </vaadin-tabs>
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                  <editor-edit-xform-affine-panel .visible=${this.selectedTransformTab === 0}
                    .afterPropertyChange=${this.rerender}></editor-edit-xform-affine-panel>
                  <editor-edit-xform-nonlinear-panel .visible=${this.selectedTransformTab === 1}
                    .afterPropertyChange=${this.rerender}></editor-edit-xform-nonlinear-panel>
                  <editor-edit-xform-xaos-panel .visible=${this.selectedTransformTab === 2}
                    .afterPropertyChange=${this.rerender}></editor-edit-xform-xaos-panel>
                  <editor-edit-xform-color-panel .visible=${this.selectedTransformTab === 3}
                    .afterPropertyChange=${this.rerender}></editor-edit-xform-color-panel>
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
                this.currFlame = new Flame()
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
                this.currFlame = FlameMapper.mapFromBackend(randomFlame.flame)
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

        FlamesEndpoint.generateRandomGradientForFlame(FlameMapper.mapToBackend(this.currFlame)).then(
          randomFlame => {
              editorStore.refreshing = true
              try {
                this.currFlame = FlameMapper.mapFromBackend(randomFlame.flame)
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

    rerender = ()=> {
      editorStore.refreshing = true
      try {
        this.getRenderPanel().rerenderFlame()
        editorStore.calculating = false
      }
      finally {
        editorStore.refreshing = false
      }
    }

  private get currFlame() {
    return editorStore.currFlame
  }

  private set currFlame(newFlame) {
    editorStore.currFlame = newFlame
  //  editorStore.currLayer = newFlame.layers[0]
  //  editorStore.currXform = editorStore.currLayer.xforms[0]
    this.flameCameraPanel.refreshForm()
    this.flameColoringPanel.refreshForm()
    this.flameDenoiserPanel.refreshForm()
    this.flameMotionPanel.refreshForm()
    this.flameLayersPanel.refreshForm()
    this.xformAffinePanel.renderControls()
    this.xformNonlinearPanel.renderControls()
    this.xformXaosPanel.renderControls()
    this.xformColorPanel.renderControls()
  }

}