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

import {makeAutoObservable} from 'mobx';
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";
import {Flame, Layer, XForm} from "Frontend/flames/model/flame";
import {registerVars_All} from "Frontend/flames/renderer/variations/variation-shaders-all";

export class EditorStore {
  initFlag = false
  refreshing = true
  variations: string[] = []
  calculating = false
  lastError = ''
  currFlame = new Flame()
  currLayer: Layer | undefined = undefined
  currXform: XForm | undefined = undefined

  constructor() {
    makeAutoObservable(this);
  }

  async initialize() {
    if(!this.initFlag) {
      let vars = [...VariationShaders.varNameList]
      vars.sort()
      this.variations = vars
      this.initFlag = true
    }
  }

  get currLayers(): Array<Layer> {
    return this.currFlame.layers
  }

  get currXForms(): Array<XForm> {
    return this.currLayer? this.currLayer.xforms : []
  }

}

registerVars_All()

export const editorStore = new EditorStore()
