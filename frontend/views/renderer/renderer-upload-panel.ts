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
import {rendererStore} from "Frontend/stores/renderer-store";
import {FlamesEndpoint, GalleryEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from "Frontend/flames/model/mapper/flame-mapper";

@customElement('renderer-upload-panel')
export class RendererUploadPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @query('vaadin-upload')
  private upload?: Upload;

  render() {
    return html`
      <div style="${this.visible ? `display:block;`: `display:none;`}">
        <div style="display:flex; flex-direction: column;">
            <vaadin-upload
                    id="upload"
                    accept="application/flame,.flame"
                    max-files="50"
                    target="upload"
                    @upload-success="${this.uploadFileSuccessHandler}"
            >
                        <span slot="file-list" style="font-size: x-small;">
          Most flame-files should work, but please note that not all features are implemented yet in Swan
        </span>
                
            </vaadin-upload>
        </div>
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

  private uploadFileSuccessHandler(event:UploadSuccessEvent) {
    try {
      const uuid = event.detail.xhr.response
      if(!rendererStore.hasFlameWithUuid(uuid)) {
        FlamesEndpoint.parseTempFlame(uuid).then(parsedFlame => {
          const flame = FlameMapper.mapFromBackend(parsedFlame)
          rendererStore.addFlameWithUuid(uuid, event.detail.file.name, flame)
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
