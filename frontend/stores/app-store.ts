import { RouterLocation } from '@vaadin/router';
import { makeAutoObservable } from 'mobx';
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";
import {playgroundStore} from "Frontend/stores/playground-store";
import {galleryStore} from "Frontend/stores/gallery-store";

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
    playgroundStore.initialize()
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
