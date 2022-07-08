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

import {html, PropertyValues} from 'lit'
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
import '@vaadin/app-layout/vaadin-drawer-toggle';

import {FlameRenderer} from '../../flames/renderer/flame-renderer'
import {FlamesEndpoint, GalleryEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from '../../flames/model/mapper/flame-mapper'
import '@vaadin/vaadin-combo-box';
import '../../components/swan-loading-indicator'
import '../../components/swan-error-panel'
import '../../components/swan-render-panel'
import '../../components/swan-notification-panel'
import '../../components/swan-number-slider'
import {BeforeEnterObserver, PreventAndRedirectCommands, Router, RouterLocation} from "@vaadin/router";
import {SwanRenderPanel} from "Frontend/components/swan-render-panel";

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
import './editor-xforms-grid-panel'
import {EditorEditLayersPanel} from "Frontend/views/editor/editor-edit-layers-panel";
import {EditorXformsGridPanel} from "Frontend/views/editor/editor-xforms-grid-panel";
import {
  EmptyAction, GenerateRandomFlameAction,
  LoadExampleFlameAction, LoadRandomFlameAction,
  LoadRandomSubFlameAction,
  startupActionHolder
} from "Frontend/stores/editor-startup-actions";
import {renderInfoStore} from "Frontend/stores/render-info-store";
import {singleRendererStore} from "Frontend/stores/single-renderer-store";
import {cloneDeep} from "lodash";

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

  @query('editor-edit-layers-panel')
  flameLayersPanel!: EditorEditLayersPanel

  @query('editor-xforms-grid-panel')
  transformsGridPanel!: EditorXformsGridPanel

  render() {
        return html`
          <header class="bg-base border-b border-contrast-10 box-border flex h-xl items-center w-full" slot="navbar">
            <vaadin-drawer-toggle aria-label="Menu toggle" class="text-secondary" theme="contrast"></vaadin-drawer-toggle>
            <h1 class="m-0 text-l" style="margin-right: 1em;">${msg('Flame editor')}</h1>
            <editor-toolbar-panel 
                      .onEditPasteFlameFromClipboard="${this.importParamsFromClipboard}"
                      .onEditCopyFlameToClipboard="${this.exportParamsToClipboard}"
                      .onNewBlankFlame="${this.createBlankFlame}"
                      .onNewRandomFlame="${this.createRandomFlame}"
                      .onNewRandomGradient="${this.createRandomGradient}"
                      .onEditUndo="${this.undoEdit}"
                      .onEditRedo="${this.redoEdit}"
                      .onToolsSendToRenderer="${this.sendFlameToRenderer}"
                    ></editor-toolbar-panel>
          </header>
          <swan-notification-panel></swan-notification-panel>
          <swan-error-panel .errorMessage=${editorStore.lastError}></swan-error-panel>
          <vaadin-vertical-layout style="width: 100%;">
            <vaadin-horizontal-layout>
              <swan-render-panel
                      .containerWidth="${'34em'}" .containerHeight="${'34em'}"
                      .canvasDisplayWidth="${'30em'}" .canvasDisplayHeight="${'30em'}"
                      .onCreateFlameRenderer=${this.createFlameRenderer}
                      .sharedRenderCtx=${editorStore.sharedRenderCtx}></swan-render-panel>
              <editor-xforms-grid-panel .afterPropertyChange=${this.reRender}></editor-xforms-grid-panel>
              ${this.renderTransformTabs()}
            </vaadin-horizontal-layout>
            ${this.renderFlameTabs()}
          </vaadin-vertical-layout>
        `;
    }

    createFlameRenderer = ()=> {
        return new FlameRenderer(editorStore.sharedRenderCtx,512, 256,
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
           renderInfoStore.calculating = true
           editorStore.lastError = ''
           FlamesEndpoint.parseFlame(text).then(flame => {
               editorStore.refreshing = true
               try {
                 this.currFlame = FlameMapper.mapFromBackend(flame)
                   this.getRenderPanel().rerenderFlame()
                   renderInfoStore.calculating = false
               }
               finally {
                   editorStore.refreshing = false
               }
           }).catch(err=> {
             console.log('ERROR', err)
               renderInfoStore.calculating = false
               editorStore.lastError = err
           })
         }
       )
    }

    onBeforeEnter(
        _location: RouterLocation,
        _commands: PreventAndRedirectCommands,
        _router: Router) {
      {
        const exampleName = _location.params['example'] as string;
        if (exampleName && exampleName !== '') {
          startupActionHolder.action = new LoadExampleFlameAction(exampleName)
          return
        }
      }
      {
        const rndGenName = _location.params['rndGenName'] as string;
        if (rndGenName && rndGenName !== '') {
          startupActionHolder.action = new GenerateRandomFlameAction(rndGenName)
          return
        }
      }
      {
        const rndFlameName = _location.params['rndFlameName'] as string;
        if (rndFlameName && rndFlameName !== '') {
          const parentRndFlameName = _location.params['parentRndFlameName'] as string;
          if (parentRndFlameName && parentRndFlameName.length > 0) {
            startupActionHolder.action = new LoadRandomSubFlameAction(parentRndFlameName, rndFlameName)
            return
          } else {
            startupActionHolder.action = new LoadRandomFlameAction(rndFlameName)
            return
          }
        }
      }
      startupActionHolder.action = new EmptyAction()
    }

    private renderFlameTabs = () => {
        return html `
           <div style="display: flex; flex-direction: column; padding: 0.5em;">
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
                     .afterPropertyChange=${this.reRender}></editor-edit-camera-panel>
                    <editor-edit-coloring-panel .visible=${this.selectedFlameTab === 1}
                      .afterPropertyChange=${this.reRender}></editor-edit-coloring-panel>
                    <editor-edit-denoiser-panel .visible=${this.selectedFlameTab === 2}
                      .afterPropertyChange=${this.reRender}></editor-edit-denoiser-panel>
                    <editor-edit-motion-panel .visible=${this.selectedFlameTab === 3}
                      .afterPropertyChange=${this.reRender}></editor-edit-motion-panel>
                    <editor-edit-layers-panel .visible=${this.selectedFlameTab === 4}
                      .afterPropertyChange=${this.reRender}></editor-edit-layers-panel>
                 </div>
           </div>`
    }

  private renderTransformTabs = () => {
    return html `
           <div style="display: flex; flex-direction: column; padding: 0.5em;">
              
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
               <vaadin-scroller style="height: 22em; width: 100%;">
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                  <editor-edit-xform-affine-panel .visible=${this.selectedTransformTab === 0}
                    .afterPropertyChange=${this.reRender} .onPropertyChange="${this.fluidReRender}" ></editor-edit-xform-affine-panel>
                  <editor-edit-xform-nonlinear-panel .visible=${this.selectedTransformTab === 1}
                    .afterPropertyChange=${this.reRender}></editor-edit-xform-nonlinear-panel>
                  <editor-edit-xform-xaos-panel .visible=${this.selectedTransformTab === 2}
                    .afterPropertyChange=${this.reRender}></editor-edit-xform-xaos-panel>
                  <editor-edit-xform-color-panel .visible=${this.selectedTransformTab === 3}
                    .afterPropertyChange=${this.reRender}></editor-edit-xform-color-panel>
                 </div>
               </vaadin-scroller>
           </div>`
  }


  getRenderPanel = (): SwanRenderPanel =>  {
        return document.querySelector('swan-render-panel')!
  }

    createBlankFlame = () => {
        renderInfoStore.calculating = true
        editorStore.lastError = ''

        FlamesEndpoint.generateRandomFlame(editorStore.variations).then(
          randomFlame => {
              editorStore.refreshing = true
              try {
                this.currFlame = new Flame()
                  this.getRenderPanel().rerenderFlame()
                  renderInfoStore.calculating = false
              }
              finally {
                  editorStore.refreshing = false
              }
          }
        ).catch(err=> {
            renderInfoStore.calculating = false
            editorStore.lastError = err
        })
    }

    createRandomFlame = () => {
        renderInfoStore.calculating = true
        editorStore.lastError = ''

        FlamesEndpoint.generateRandomFlame(editorStore.variations).then(
          randomFlame => {
              editorStore.refreshing = true
              try {
                this.currFlame = FlameMapper.mapFromBackend(randomFlame.flame)
                  this.getRenderPanel().rerenderFlame()
                  renderInfoStore.calculating = false
              }
              finally {
                  editorStore.refreshing = false
              }
          }
        ).catch(err=> {
            renderInfoStore.calculating = false
            editorStore.lastError = err
        })
    }

    createRandomGradient = () => {
        renderInfoStore.calculating = true
        editorStore.lastError = ''

        FlamesEndpoint.generateRandomGradientForFlame(FlameMapper.mapToBackend(this.currFlame)).then(
          randomFlame => {
              editorStore.refreshing = true
              try {
                this.currFlame = FlameMapper.mapFromBackend(randomFlame.flame)
                  this.getRenderPanel().rerenderFlame()
                  renderInfoStore.calculating = false
              }
              finally {
                  editorStore.refreshing = false
              }
          }
        ).catch(err=> {
            renderInfoStore.calculating = false
            editorStore.lastError = err
        })
    }

    fluidReRender = (paramId: number, refValue: number, newValue: number) => {
      editorStore.refreshing = true
      try {
        this.getRenderPanel().fluidReRenderFlame(undefined, paramId, refValue, newValue)
        renderInfoStore.calculating = false
      }
      finally {
        editorStore.refreshing = false
      }
    }

    reRender = ()=> {
      editorStore.refreshing = true
      try {
        this.getRenderPanel().rerenderFlame()
        renderInfoStore.calculating = false
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
    setTimeout(()=>{
      this.flameLayersPanel.selectFirstLayer()
      // seems to modify the flame (!?)
     // setTimeout(()=>this.transformsGridPanel.selectFirstXform(), 250)
    }, 250)
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    startupActionHolder.action.execute()
    editorStore.registerInitCallback(['editor-xforms-grid-panel'], this.renderFirstFlame)
  }

  renderFirstFlame = ()=> {
    this.getRenderPanel().rerenderFlame()
  }

  setEditflame = (newFlame: Flame) => {
    const layerIdx = editorStore.currLayer ? editorStore.currFlame.layers.indexOf(editorStore.currLayer) : -1
    editorStore.currFlame = newFlame
    if(layerIdx >=0 && layerIdx<editorStore.currFlame.layers.length) {
      editorStore.currLayer = editorStore.currFlame.layers[layerIdx]
    }
    this.getRenderPanel().rerenderFlame()
  }

  undoEdit = () => {
    let newFlame = editorStore.undoManager.undo()
    console.log("UNDO", newFlame)
    if(newFlame) {
      this.setEditflame(newFlame)
    }
  }


  redoEdit = () => {
    let newFlame = editorStore.undoManager.redo()
    if(newFlame) {
      this.setEditflame(newFlame)
    }
  }

  sendFlameToRenderer = ()=> {
    singleRendererStore.flame = cloneDeep(editorStore.currFlame)
    Router.go('/single-renderer/?refresh')
  }
}