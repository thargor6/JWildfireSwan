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

import {css, html, PropertyValues, render} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";

import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-dialog';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import '@vaadin/tabs'

import {localized, msg} from '@lit/localize';
import {infoStore} from "Frontend/views/editor/editor-flame-info-dialog-store";
import {FlamesEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from "Frontend/flames/model/mapper/flame-mapper";
import {editorStore} from "Frontend/stores/editor-store";
import 'lit-code'
import 'prismjs'
import * as Prism from 'prismjs';

@localized()
@customElement('editor-flame-info-dialog-content')
export class EditorFlameInfoDialogContent extends MobxLitElement {

  @query('#main_container')
  mainCodeContainer!: HTMLElement

  // more infos about lit-code: https://www.npmjs.com/package/lit-code
  static styles = css`
    lit-code {
      max-width: 50em;  
      --font-family: monospace;
      --font-size:   10pt;
      --line-height: 12pt;
      --lines-width: 40px;
      
      --editor-bg-color:    white;
      --editor-text-color:  black;
      --editor-caret-color: var(--editor-text-color);
      --editor-sel-color:   #b9ecff;
      
      --lines-bg-color:     #eee;
      --lines-text-color:   black;
      --scroll-track-color: #aaa;
      --scroll-thumb-color: #eee;
      
      /*lit-theme colors for default highlight tokens */
      --hl-color-string:      #00ae22;
      --hl-color-function:    #004eff;
      --hl-color-number:      #dd9031;
      --hl-color-operator:    #5a5a5a;
      --hl-color-class-name:  #78c3ca;
      --hl-color-punctuation: #4a4a4a;
      --hl-color-keyword:     #8500ff;
      --hl-color-comment:     #aaa;
    }
   
  `;

  render() {
    return html`
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
            <div id="main_container2" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                <div style="${infoStore.selectedTab === 0 ? `display:block;` : `display:none;`}">
                  <lit-code language='js'
                            .code=${JSON.stringify(infoStore.currFlame, null, 2)}
                            .grammar=${Prism.languages.js} noshadow mycolors linenumbers><lit-code>
                </div>
                <div style="${infoStore.selectedTab === 1 ? `display:block;` : `display:none;`}">
                    <lit-code language='js'
                              .code=${JSON.stringify(infoStore.currRenderFlame, null, 2)}
                              .grammar=${Prism.languages.js} noshadow mycolors linenumbers><lit-code>  
                </div>
                <div style="${infoStore.selectedTab === 2 ? `display:block;` : `display:none;`}">
                    <lit-code language='clike'
                              .code=${infoStore.currProgPointsVertexShader}
                              .grammar=${Prism.languages.clike} noshadow mycolors linenumbers><lit-code>
                </div>
                <div style="${infoStore.selectedTab === 3 ? `display:block;` : `display:none;`}">
                    <lit-code language='clike'
                              .code=${infoStore.currCompPointsFragmentShader}
                              .grammar=${Prism.languages.clike} noshadow mycolors linenumbers><lit-code>
                </div>
                <div style="${infoStore.selectedTab === 4 ? `display:block;` : `display:none;`}">
                    <vaadin-button @click="${this.generateFlameXml}">${msg('Generate xml')}</vaadin-button>
                    <vaadin-text-area style="width: 50em; min-height: 30em;"
                                      .value=${infoStore.currParamsAsXml}></vaadin-text-area>
                </div>
            </div>


        </vaadin-vertical-layout>
    `;
  }

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

}
