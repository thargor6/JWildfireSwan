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

import {html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";
import {Upload, UploadSuccessEvent} from "@vaadin/upload";
import "@vaadin/upload";
import '@vaadin/vaadin-checkbox'
import {rendererStore} from "Frontend/stores/renderer-store";
import {FlamesEndpoint, GalleryEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from "Frontend/flames/model/mapper/flame-mapper";
import {Parameters} from "Frontend/flames/model/parameters";

@customElement('renderer-upload-panel')
export class RendererUploadPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @query('vaadin-upload')
  private upload?: Upload

  @state()
  evalMotionCurves = false

  render() {
    return html`
      <div style="${this.visible ? `display:block;`: `display:none;`}">
          <vaadin-checkbox ?checked=${this.evalMotionCurves} @change=${(e: Event)=>this.evalMotionCurves = (e.target as any) ? true: false} label="Render frames/evaluate motion curves"></vaadin-checkbox>
          <vaadin-upload
                    id="upload"
                    accept="application/flame,.flame"
                    max-files="200"
                    target="upload"
                    @upload-success="${this.uploadFileSuccessHandler}">
                <span slot="file-list" style="font-size: x-small;">
                 Most flame-files should work, but please note that not all features are implemented yet in Swan
               </span>
            </vaadin-upload>
      </div>
     `;
  }

  firstUpdated() {
    if (this.upload?.i18n) {
      this.upload.i18n.addFiles.many = 'Upload flame...';
      this.upload.i18n.dropFiles.many = 'Drop flame here';
      this.upload.i18n.error.incorrectFileType =
        'The provided file does not have the correct format. Please provide a flame-xml document.';
      this.upload.i18n = { ...this.upload.i18n };
    }
  }

  private numericPostfix(n: number) {
    let postfix = `${n}`
    while(postfix.length<4) {
      postfix='0' + postfix
    }
    postfix = '_' + postfix
    return postfix
  }

  private addNumericPostfix(name: string, n: number) {
    const postfix = this.numericPostfix(n)
    for(let i=name.length-1;i>0;i--) {
      if(name.charAt(i)=='.') {
        return name.substring(0, i) + postfix + name.substring(i, name.length)
      }
    }
    return name+postfix
  }

  private uploadFileSuccessHandler(event:UploadSuccessEvent) {
    try {
      const uuid = event.detail.xhr.response
      if(!rendererStore.hasFlameWithUuid(uuid)) {
        FlamesEndpoint.parseTempFlame(uuid).then(parsedFlame => {
          const flame = FlameMapper.mapFromBackend(parsedFlame)
          if(flame.frameCount.value<=1 || !this.evalMotionCurves) {
            rendererStore.addFlameWithUuid(uuid, event.detail.file.name, flame)
          }
          else {
            for(let frame=1; frame<=flame.frameCount.value; frame++) {
              const currFlame = FlameMapper.mapFromBackend(FlameMapper.mapToBackend(flame))
              currFlame.frame =  Parameters.intParam(frame)
              const currName = this.addNumericPostfix(event.detail.file.name, frame)
              rendererStore.addFlameWithUuid(uuid+this.numericPostfix(frame), currName, currFlame)
            }
          }
        }).catch(err=> {
          rendererStore.lastError = err
        })
      }
      else {
        console.log(`Flame with uuid ${uuid} skipped`)
      }
    }
    catch(err) {
      rendererStore.lastError = `${err}`
    }
  }

}
