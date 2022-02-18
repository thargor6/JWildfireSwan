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

import { makeAutoObservable } from 'mobx';
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";
import {register2DVars} from "Frontend/flames/renderer/variations/variation-shaders-2d";
import {register3DVars} from "Frontend/flames/renderer/variations/variation-shaders-3d";
import {registerZTransformVars} from "Frontend/flames/renderer/variations/variation-shaders-ztransform";
import {Flame} from "Frontend/flames/model/flame";
import {FlameRenderer} from "Frontend/flames/renderer/flame-renderer";
import {GalleryEndpoint} from "Frontend/generated/endpoints";

type OnInitCallback = () => void

export class PlaygroundStore {
  initFlag = false
  variations: string[] = []
  initState = new Set<string>()
  onInitCallbacks = new Map<string[], OnInitCallback>()
  calculating = false
  lastError = ''
  flame!: Flame
  renderer!: FlameRenderer
  exampleFlamenames: string[] = []

  constructor() {
    makeAutoObservable(this);

  }

  async initialize() {
    if(!this.initFlag) {
      let vars = [...VariationShaders.varNameList]
      vars.sort()
      this.variations = vars
      const examples = await GalleryEndpoint.getExampleList()
      this.exampleFlamenames = examples.sort((a, b) => a.localeCompare(b)  )
      this.initFlag = true
      this.notifyInit('store')
    }
  }

  notifyInit(tagName: string) {
    this.initState.add(tagName)
    this.executeOnInitCallbacks()
  }

  registerInitCallback(componentIds: string[], cb: OnInitCallback) {
    this.onInitCallbacks.set(['store', ...componentIds], cb)
  }

  private executeOnInitCallbacks() {
    let removeCbs = new Array<string[]>()
    this.onInitCallbacks.forEach((value, key) => {
      let registerState = true
      key.forEach(key => {
        if(!this.initState.has(key)) {
          registerState = false
        }
      })
      if(registerState) {
        removeCbs.push(key)
        value()
      }
    })
    // remove executed callbacks
    removeCbs.forEach(key=>this.onInitCallbacks.delete(key))
  }

  public randomExampleFlamename = ()=> {
    const idx = Math.floor( this.exampleFlamenames.length * Math.random())
    return idx>=0 && idx<this.exampleFlamenames.length ? this.exampleFlamenames[idx] : ''
  }
}


register2DVars()
register3DVars()
registerZTransformVars()

export const playgroundStore = new PlaygroundStore()
