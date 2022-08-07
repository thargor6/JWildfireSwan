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
import {FlamesEndpoint} from "Frontend/generated/endpoints";
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
import {DenoiserType, Flame} from "Frontend/flames/model/flame";

import './editor-xforms-grid-panel'
import './editor-flame-info-dialog'
import './editor-undo-history-dialog'
import './editor-flame-tabs-panel'
import './editor-xform-tabs-panel'
import './editor-anim-frame-panel'

import {EditorXformsGridPanel} from "Frontend/views/editor/editor-xforms-grid-panel";
import {
  EmptyAction, GenerateRandomFlameAction,
  LoadRandomFlameAction,
  LoadRandomSubFlameAction,
  startupActionHolder
} from "Frontend/stores/editor-startup-actions";
import {renderInfoStore} from "Frontend/stores/render-info-store";
import {singleRendererStore} from "Frontend/stores/single-renderer-store";
import {cloneDeep} from "lodash";
import {EditorFlameInfoDialog} from "Frontend/views/editor/editor-flame-info-dialog";
import {EditorUndoHistoryDialog} from "Frontend/views/editor/editor-undo-history-dialog";
import {LoadExampleFlameAction} from "Frontend/views/editor/editor-view-startup-actions";
import {EditorFlameTabsPanel} from "Frontend/views/editor/editor-flame-tabs-panel";
import {EditorXformTabsPanel} from "Frontend/views/editor/editor-xform-tabs-panel";
import {EditorAnimFramePanel} from "Frontend/views/editor/editor-anim-frame-panel";
import {Parameters} from "Frontend/flames/model/parameters";

@localized()
@customElement('editor-view')
export class EditorView extends View implements BeforeEnterObserver {

  @query('swan-notification-panel')
  notificationPnl!: SwanNotificationPanel

  @query('editor-flame-tabs-panel')
  editorFlameTabsPanel!: EditorFlameTabsPanel

  @query('editor-xform-tabs-panel')
  editorXformTabsPanel!: EditorXformTabsPanel

  @query('editor-xforms-grid-panel')
  transformsGridPanel!: EditorXformsGridPanel

  @query('editor-flame-info-dialog')
  flameInfoDialog!: EditorFlameInfoDialog

  @query('editor-undo-history-dialog')
  undoHistoryDialog!: EditorUndoHistoryDialog

  @query('editor-anim-frame-panel')
  animFramePanel!: EditorAnimFramePanel

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
                  .onToolsShowFlameInfo="${this.showFlameInfo}"
                  .onToolsShowUndoHistory="${this.showUndoHistory}"
                ></editor-toolbar-panel>
      </header>
      <div>
        <swan-notification-panel></swan-notification-panel>
        <swan-error-panel .errorMessage=${editorStore.lastError}></swan-error-panel>
        <editor-flame-info-dialog></editor-flame-info-dialog>
        <editor-undo-history-dialog></editor-undo-history-dialog>
      </div>
      <vaadin-vertical-layout style="width: 100%;">
        <vaadin-horizontal-layout>
          <swan-render-panel
                  .containerWidth="${'32em'}" .containerHeight="${'32em'}"
                  .canvasDisplayWidth="${'28em'}" .canvasDisplayHeight="${'28em'}"
                  .onCreateFlameRenderer=${this.createFlameRenderer}
                  .sharedRenderCtx=${editorStore.sharedRenderCtx}></swan-render-panel>
          <editor-xforms-grid-panel .afterPropertyChange=${this.reRender} 
                .afterXformStructureChange="${this.afterLayerChange}"                           
                .afterSelectionChange="${this.afterXformChange}"></editor-xforms-grid-panel>
          <editor-xform-tabs-panel .reRender=${this.reRender} .fluidReRender=${this.fluidReRender}></editor-xform-tabs-panel>
        </vaadin-horizontal-layout>
        <editor-anim-frame-panel .afterPropertyChange=${this.reRender} 
           .playAnimation=${this.playAnimation} .afterFrameChanged=${this.afterAnimFrameChange}></editor-anim-frame-panel>  
        <editor-flame-tabs-panel .reRender=${this.reRender} .afterLayerChange=${this.afterLayerChange}></editor-flame-tabs-panel>
      </vaadin-vertical-layout>
    `;
  }

  afterFlameChange =() => {
    this.editorFlameTabsPanel.cameraPanel.requestContentUpdate()
    this.editorFlameTabsPanel.coloringPanel.requestContentUpdate()
    this.editorFlameTabsPanel.denoiserPanel.requestContentUpdate()
    this.editorFlameTabsPanel.motionPanel.requestContentUpdate()
    this.animFramePanel.requestContentUpdate()
    this.editorFlameTabsPanel.layersPanel.refreshLayers()
  }

  afterLayerChange =() => {
    this.editorFlameTabsPanel.layersPanel.requestContentUpdate()
    this.transformsGridPanel.refreshXforms()
    this.transformsGridPanel.selectFirstXform()
  }

  afterXformChange = () => {
    this.editorXformTabsPanel.xformAffinePanel.requestContentUpdate()
    this.editorXformTabsPanel.xformColorPanel.requestContentUpdate()
    this.editorXformTabsPanel.xformNonlinearPanel.refreshVariations()
  }

  afterAnimFrameChange =() => {
    this.afterFlameChange()
    this.afterLayerChange()
    this.afterXformChange()
  }

    createFlameRenderer = ()=> {
      if(editorStore.playingAnimation) {
        return new FlameRenderer(editorStore.sharedRenderCtx,256, 256,
          DisplayMode.FLAME, this.getRenderPanel().canvas,
          undefined, false,
          '',
          undefined, 0.85, true,
          this.currFlame)
      }
      else {
        return new FlameRenderer(editorStore.sharedRenderCtx,512, 256,
          DisplayMode.FLAME, this.getRenderPanel().canvas,
          undefined, false,
          '',
          undefined, 1.0, false,
          this.currFlame)
      }
    }

    exportParamsToClipboard = (): void => {
        FlamesEndpoint.convertFlameToXml(FlameMapper.mapToBackend(this.currFlame)).then(flameXml => {
            navigator.clipboard.writeText(flameXml)
            this.notificationPnl.showNotifivation(msg('Parameters were copied to the clipboard'))
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
                   this.reRender()
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
          startupActionHolder.action = new LoadExampleFlameAction(this, exampleName)
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
                  this.reRender()
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
                  this.reRender()
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
                  this.reRender()
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
      let renderPanel = this.getRenderPanel()
      renderPanel.onAfterRenderFinishedOnce = undefined
      renderPanel.rerenderFlame()
    }

  reRenderWithCallback = (cb: ()=>void)=> {
    let renderPanel = this.getRenderPanel()
    renderPanel.onAfterRenderFinishedOnce = cb
    renderPanel.rerenderFlame()
  }

  get currFlame() {
    return editorStore.currFlame
  }

  public set currFlame(newFlame) {
    editorStore.currFlame = newFlame
    this.afterFlameChange()
    this.editorFlameTabsPanel.layersPanel.selectFirstLayer()
  }

  connectedCallback() {
    super.connectedCallback()
    editorStore.registerInitCallback(['editor-edit-camera-panel', 'editor-xforms-grid-panel', 'editor-edit-layers-panel'], this.renderFirstFlame)
  }

  renderFirstFlame = ()=> {
    startupActionHolder.action.execute()
    this.reRender()
    if(editorStore.currFlame.layers.length>0 && this.editorFlameTabsPanel.layersPanel) {
      this.editorFlameTabsPanel.layersPanel.selectFirstLayer()
    }
    this.requestUpdate()
  }

  setEditflame = (newFlame: Flame) => {
    const layerIdx = editorStore.currLayer ? editorStore.currFlame.layers.indexOf(editorStore.currLayer) : -1
    editorStore.currFlame = newFlame
    if(layerIdx >=0 && layerIdx<editorStore.currFlame.layers.length) {
      editorStore.currLayer = editorStore.currFlame.layers[layerIdx]
    }
    this.reRender()
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

  showFlameInfo = ()=> {
    this.flameInfoDialog.refreshInfos()
    this.flameInfoDialog.dialogOpened = true
  }

  showUndoHistory = ()=> {
    this.undoHistoryDialog.refreshHistory()
    this.undoHistoryDialog.dialogOpened = true
  }

  renderNextFrame = (startFrame: number, frameCount: number, prevFrame: number) => {
    try {
      if (prevFrame < frameCount) {
        const currFrame = prevFrame + 3
        editorStore.currFlame.frame = Parameters.intParam(currFrame)
        this.reRenderWithCallback(this.renderNextFrame.bind(this, startFrame, frameCount, currFrame))
      } else {
        editorStore.currFlame.frame = Parameters.intParam(startFrame)
        editorStore.playingAnimation = false
        this.reRender()
      }
    }
    catch(error) {
      editorStore.playingAnimation = false
      editorStore.lastError = `${error}`
    }
  }

  playAnimation = ()=> {
    if(editorStore.currFlame.layers.length>0) {
      editorStore.lastError = ''
      editorStore.playingAnimation = true
      try {
        const currFrame = 1 // editorStore.currFlame.frame.value
        const frameCount = editorStore.currFlame.frameCount.value
        editorStore.currFlame.frame = Parameters.intParam(currFrame)
        editorStore.currFlame.dnType = DenoiserType.OFF
        this.reRenderWithCallback(this.renderNextFrame.bind(this, currFrame, frameCount, currFrame))
      }
      catch(error) {
        editorStore.playingAnimation = false
        editorStore.lastError = `${error}`
      }
    }
  }
}