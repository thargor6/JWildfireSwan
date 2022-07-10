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
import {Flame} from "Frontend/flames/model/flame";
import {RenderFlame} from "Frontend/flames/model/render-flame";
import {Dialog} from "@vaadin/dialog";
import {editorStore} from "Frontend/stores/editor-store";
import {cloneDeep} from "lodash";
import {autorun, reaction, IReactionDisposer, makeAutoObservable} from "mobx";
import {TemplateResult} from "lit-html";
import {FlamesEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from "Frontend/flames/model/mapper/flame-mapper";

let disposer: IReactionDisposer | undefined = undefined

class EditorFlameInfoDialogStore {
  selectedTab = 0
  currFlame: Flame = new Flame()
  currRenderFlame: RenderFlame = new RenderFlame()
  currProgPointsVertexShader = ''
  currCompPointsFragmentShader = ''
  currParamsAsXml = ''

  constructor() {
    makeAutoObservable(this);
  }

  registerRefresh(dialog: Dialog) {
    if(disposer) {
      disposer()
      disposer = undefined
    }
    disposer = autorun(()=>{
      if(this.selectedTab>=0) {
        dialog.requestContentUpdate()
      }
    })
  }
}

const infoStore = new EditorFlameInfoDialogStore()


@localized()
@customElement('editor-flame-info-dialog')
export class EditorFlameInfoDialog extends MobxLitElement {
  @state()
  dialogOpened = false

  @query('vaadin-dialog')
  dialog!: Dialog

  @query('vaadin-tabs')
  tabs!: HTMLElement

  private disposer: IReactionDisposer | undefined = undefined

  textAreaWidth = '50em'
  textAreaHeight = '30em'

  render() {
    return html`
      <vaadin-dialog
        header-title="${msg('Flame info')}"
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

  dialogLayout = ()=> html`
    <vaadin-vertical-layout style="align-items: stretch; width: 50rem; min-height: 10em; max-width: 100%;">
        <vaadin-tabs @selected-changed="${this.selectedTabChanged}">
          <vaadin-tab theme="icon-on-top">
              <span>${msg('Raw flame params')}</span>
          </vaadin-tab>
          <vaadin-tab theme="icon-on-top">
              <span>${msg('Prepared render params')}</span>
          </vaadin-tab>
          <vaadin-tab theme="icon-on-top">
              <span>${msg('Vertex shader')}</span>
          </vaadin-tab>
          <vaadin-tab theme="icon-on-top">
              <span>${msg('Fragment shader')}</span>
          </vaadin-tab>
          <vaadin-tab theme="icon-on-top">
            <span>${msg('Params as Xml')}</span>
          </vaadin-tab>
      </vaadin-tabs>
      <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
          <div style="${infoStore.selectedTab===0 ? `display:block;`: `display:none;`}">
              <vaadin-text-area style="min-width: ${this.textAreaWidth}; min-height: ${this.textAreaHeight};" 
                .value=${JSON.stringify(infoStore.currFlame)}></vaadin-text-area>
          </div>
          <div style="${infoStore.selectedTab===1 ? `display:block;`: `display:none;`}">
              <vaadin-text-area style="min-width: ${this.textAreaWidth}; min-height: ${this.textAreaHeight};"
                                .value=${JSON.stringify(infoStore.currRenderFlame)}></vaadin-text-area>
          </div>
          <div style="${infoStore.selectedTab===2 ? `display:block;`: `display:none;`}">
              <vaadin-text-area style="min-width: ${this.textAreaWidth}; min-height: ${this.textAreaHeight};"
                                .value=${infoStore.currProgPointsVertexShader}></vaadin-text-area>
          </div>
          <div style="${infoStore.selectedTab===3 ? `display:block;`: `display:none;`}">
              <vaadin-text-area style="min-width: ${this.textAreaWidth}; min-height: ${this.textAreaHeight};"
                                .value=${infoStore.currCompPointsFragmentShader}></vaadin-text-area>
          </div>
          <div style="${infoStore.selectedTab===4 ? `display:block;`: `display:none;`}">
              <vaadin-button @click="${this.generateFlameXml}">${msg('Generate xml')}</vaadin-button>
              <vaadin-text-area style="width: ${this.textAreaWidth}; min-height: ${this.textAreaHeight};"
                                .value=${infoStore.currParamsAsXml}></vaadin-text-area>
          </div>
       </div>

        
        
    </vaadin-vertical-layout>
  `;

  footerLayout = html`
    <vaadin-button @click="${() => (this.dialogOpened = false)}">${msg('Close')}</vaadin-button>
  `;

  selectedTabChanged(e: CustomEvent) {
    infoStore.selectedTab = e.detail.value
  }

  generateFlameXml = ()=> {
    FlamesEndpoint.convertFlameToXml(FlameMapper.mapToBackend(infoStore.currFlame)).then(flameXml => {
      infoStore.currParamsAsXml = flameXml

    })
    .catch(err=> {
      editorStore.lastError = err
    })
  }

  public refreshInfos() {
    infoStore.currFlame = editorStore.sharedRenderCtx.currFlame ? cloneDeep(editorStore.sharedRenderCtx.currFlame) : new Flame()
    infoStore.currRenderFlame = editorStore.sharedRenderCtx.currRenderFlame ? cloneDeep(editorStore.sharedRenderCtx.currRenderFlame) : new RenderFlame()
    infoStore.currProgPointsVertexShader = editorStore.sharedRenderCtx.currProgPointsVertexShader ? editorStore.sharedRenderCtx.currProgPointsVertexShader : ''
    infoStore.currCompPointsFragmentShader = editorStore.sharedRenderCtx.currCompPointsFragmentShader ? editorStore.sharedRenderCtx.currCompPointsFragmentShader : ''
    infoStore.currParamsAsXml = ''
    infoStore.registerRefresh(this.dialog)
  }


}
