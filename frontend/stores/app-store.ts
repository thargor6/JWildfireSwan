import { RouterLocation } from '@vaadin/router';
import { makeAutoObservable } from 'mobx';
import {register2DVars} from "Frontend/flames/renderer/variations/variation-shaders-2d";
import {register3DVars} from "Frontend/flames/renderer/variations/variation-shaders-3d";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";

export class AppStore {
  applicationName = 'JWildfire Swan';

  loadingText = 'Loading...'

  // The location, relative to the base path, e.g. "hello" when viewing "/hello"
  location = '';

  currentViewTitle = '';

  variations: string[] = []

  constructor() {
    makeAutoObservable(this);
    this.initVariations();
  }

  async initVariations() {
    this.variations = VariationShaders.varNameList
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
}

register2DVars()
register3DVars()

export const appStore = new AppStore();
