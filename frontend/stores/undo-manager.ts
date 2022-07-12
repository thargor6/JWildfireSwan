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

import {Color, Flame, Layer, Variation, XForm} from "Frontend/flames/model/flame";
import { cloneDeep } from "lodash";
import {BooleanScalarParameter, FloatScalarParameter, IntScalarParameter} from "Frontend/flames/model/parameters";
import {msg} from "@lit/localize";

interface UndoAction {
  restore(): Flame
  caption(): string
}

export abstract class AbstractUndoAction implements UndoAction {

  getAttribute<T, K extends keyof T>(o: T, attributeName: K): T[K] {
    return o[attributeName]
  }

  setAttribute<T, K extends keyof T>(o: T, attributeName: K, newValue: T[K]): void {
    o[attributeName] = newValue
  }

  abstract restore(): Flame

  abstract caption(): string
}

export class SetAttributeAction<T> extends AbstractUndoAction {
  _oldValue: any
  _prevState: Flame

  constructor(flame: Flame, private src: T, private _key: keyof T, private _newValue: any, private _description: string) {
    super()
    this._oldValue = this.getAttribute(src, _key)
    this._prevState = cloneDeep(flame)
  }

  restore(): Flame {
    return cloneDeep(this._prevState)
  }

  getCaptionPrefix = ()=> {
    if(this.src instanceof Flame) {
      return 'flame'
    }
    else if(this.src instanceof Layer) {
      return 'layer'
    }
    else if(this.src instanceof XForm) {
      return 'xform'
    }
    else if(this.src instanceof Variation) {
      return 'variation'
    }
    else {
      return 'unknown type'
    }
  }

  caption(): string {
    return `change [${this.getCaptionPrefix()}] attribute: ${this._oldValue} -> ${this._newValue}`
  }
}

export class SetVariationAtrtrMapAttributeAction extends AbstractUndoAction {
  _oldValue: any
  _prevState: Flame

  constructor(flame: Flame, src: Variation, private _key: string, private _newValue: any, private _description: string) {
    super()
    this._oldValue = src.params.get(_key)
    this._prevState = cloneDeep(flame)
  }

  restore(): Flame {
    return cloneDeep(this._prevState)
  }

  caption(): string {
    return `change variation attribute: ${this._oldValue} -> ${this._newValue}`
  }
}

export class UndoManager {
  private _undoActions: UndoAction[] = []
  private _undoPosition = -1
  private _initialState: Flame

  constructor(flame: Flame) {
    this._initialState = cloneDeep(flame)
  }

  undo(): Flame | undefined {
    if(this._undoPosition>=0 && this._undoPosition<this._undoActions.length) {
      return this._undoActions[this._undoPosition--].restore()
    }
    else {
      return undefined
    }
  }

  redo(): Flame | undefined {
    if(this._undoPosition>=-1 && this._undoPosition<this._undoActions.length-1) {
      return this._undoActions[++this._undoPosition].restore()
    }
    else {
      return undefined
    }
  }

  get undoActions() {
    return this._undoActions
  }

  registerFlameAttributeChange(flame: Flame, key: keyof Flame, newValue: any) {
    const desc = msg('Change flame attribute')
    this._undoActions.push(new SetAttributeAction(flame, flame, key, newValue, desc))
    this._undoPosition = this._undoActions.length - 1
    console.log(this._undoPosition)
  }

  registerLayerAttributeChange(flame: Flame, layer: Layer, key: keyof Layer, newValue: any) {
    const desc = msg('Change layer attribute')
    this._undoActions.push(new SetAttributeAction(flame, layer, key, newValue, desc))
    this._undoPosition = this._undoActions.length - 1
  }

  registerXformAttributeChange(flame: Flame, xform: XForm, key: keyof XForm, newValue: any) {
    const desc = msg('Change xform attribute')
    this._undoActions.push(new SetAttributeAction(flame, xform, key, newValue, desc))
    this._undoPosition = this._undoActions.length - 1
  }

  registerVariationAttributeChange(flame: Flame, variation: Variation, key: keyof Variation, newValue: any) {
    const desc = msg('Change variation attribute')
    this._undoActions.push(new SetAttributeAction(flame, variation, key, newValue, desc))
    this._undoPosition = this._undoActions.length - 1
  }

  registerVariationAttrMapAttributeChange(flame: Flame, variation: Variation, key: string, newValue: any) {
    const desc = msg('Change variation attribute')
    this._undoActions.push(new SetVariationAtrtrMapAttributeAction(flame, variation, key, newValue, desc))
    this._undoPosition = this._undoActions.length - 1
  }
}