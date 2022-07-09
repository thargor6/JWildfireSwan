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
import {SharedRenderContext} from "Frontend/flames/renderer/shared-render-context";
import {UndoManager} from "Frontend/stores/undo-manager";

type InitCallback = () => void

const EDIT_MODE_TX_AFFINE = 0
const EDIT_MODE_TX_POST = 1
const EDIT_MODE_TX_AFFINE_POST = 2

export class EditorStore {
  initCallbacks = new Map<string[], InitCallback>()
  initState = new Set<string>()
  initFlag = false
  editModeTx = EDIT_MODE_TX_AFFINE
  _refreshing = true
  variations: string[] = []
  _lastError = ''
  _currFlame = new Flame()
  _currLayers: Layer[] = []
  _currLayer: Layer | undefined = undefined
  _currXforms: XForm[] = []
  _currXform: XForm | undefined = undefined

  private _undoManager = new UndoManager(this._currFlame)

  sharedRenderCtx = new SharedRenderContext()

  constructor() {
    makeAutoObservable(this);
  }

  async initialize() {
    if(!this.initFlag) {
      let vars = [...VariationShaders.varNameList]
      vars.sort()
      this.variations = vars
      this.initFlag = true
      this.notifyInit('store')
    }
  }


  notifyInit(tagName: string) {
    this.initState.add(tagName)
    this.executeOnInitCallbacks()
  }

  registerInitCallback(componentIds: string[], cb: InitCallback) {
    this.initCallbacks.set(['store', ...componentIds], cb)
  }

  private executeOnInitCallbacks() {
    let removeCbs = new Array<string[]>()
    this.initCallbacks.forEach((value, key) => {
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
    removeCbs.forEach(key=>this.initCallbacks.delete(key))
  }

  isEditModeAffine = () => {
    return this.editModeTx === EDIT_MODE_TX_AFFINE
  }

  checkedSetEditModeTxAffine = (checked: boolean) => {
    if(checked) {
      this.editModeTx = EDIT_MODE_TX_AFFINE
    }
  }

  isEditModePost = () => {
    return this.editModeTx === EDIT_MODE_TX_POST
  }

  checkedSetEditModeTxPost = (checked: boolean) => {
    if(checked) {
      this.editModeTx = EDIT_MODE_TX_POST
    }
  }

  checkedSetEditModeTxPostAffine = (checked: boolean) => {
    if(checked) {
      this.editModeTx = EDIT_MODE_TX_AFFINE_POST
    }
  }

  isEditModeAffinePost = () => {
    return this.editModeTx === EDIT_MODE_TX_AFFINE_POST
  }

  get currFlame() {
    return this._currFlame
  }

  set currFlame(newFlame: Flame) {
    this.refreshing = true
    try {
      this._currFlame = newFlame
      this._undoManager = new UndoManager(newFlame)
      this.refreshLayers()
      this._currLayer = undefined
    }
    finally {
      this.refreshing = false
    }
  }

  get undoManager() {
    return this._undoManager
  }

  get currLayer() {
    return this._currLayer
  }

  set currLayer(newLayer: Layer | undefined) {
    this.refreshing = true
    try {
      this._currLayer = newLayer
      if (newLayer) {
        this._currXforms = [...newLayer.xforms, ...newLayer.finalXforms]
      } else {
        this._currXforms = []
      }

      this._currXform = undefined
    }
    finally {
      this.refreshing = false
    }

  }

  get currLayers(): Array<Layer> {
    return this._currLayers
  }

  get currXform() {
    return this._currXform
  }

  set currXform(newXform: XForm | undefined) {
    this.refreshing = true
    try {
      this._currXform = newXform
    }
    finally {
      this.refreshing = false
    }
  }

  get currXforms(): Array<XForm> {
    return this._currXforms
  }

  refreshLayers() {
    this._currLayers = [...this._currFlame.layers]
  }

  get lastError() {
    return this._lastError
  }

  set lastError(value) {
    this._lastError = value
  }

  get refreshing() {
    return this._refreshing
  }

  set refreshing(newValue) {
    this._refreshing = newValue
  }
}

registerVars_All()

export const editorStore = new EditorStore()
