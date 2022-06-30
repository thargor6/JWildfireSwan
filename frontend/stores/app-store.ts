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
import { RouterLocation } from '@vaadin/router';
import { makeAutoObservable } from 'mobx';
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";
import {galleryStore} from "Frontend/stores/gallery-store";
import {editorStore} from "Frontend/stores/editor-store";

export class AppStore {
  applicationName = 'JWildfire Swan';

  loadingText = 'Loading...'

  // The location, relative to the base path, e.g. "hello" when viewing "/hello"
  location = '';

  currentViewTitle = '';

  variations: string[] = []

  _hasElectron = false
  _checkedForElectron = false
  _ipcRenderer: any = undefined

  constructor() {
    makeAutoObservable(this);
    this.initVariations();
  }

  async initVariations() {
    this.variations = VariationShaders.varNameList
    editorStore.initialize()
    galleryStore.initialize()
  }

  setLocation(location: RouterLocation) {
    if (location.route && location.route.path != '(.*)') {
      this.location = location.route.path;
    } else if (location.pathname.startsWith(location.baseUrl)) {
      this.location = location.pathname.substr(location.baseUrl.length);
    } else {
      this.location = location.pathname;
    }
    this.currentViewTitle = (location?.route as any)?.title || '';
  }

  get hasElectron(): boolean {
    if(!this._checkedForElectron) {
      this._hasElectron = false
      if (window.require) {
        const electron = window.require('electron')
        if(electron) {
          this._ipcRenderer = electron.ipcRenderer
          this._hasElectron = this._ipcRenderer ? true : false
        }
      }
      this._checkedForElectron = true
    }
    return this._hasElectron
  }

  get ipcRenderer() {
    return this.hasElectron ? this._ipcRenderer : undefined
  }

}

export const appStore = new AppStore();
