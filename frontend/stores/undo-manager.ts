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

}

export abstract class AbstractUndoAction implements UndoAction {

  getAttribute<T, K extends keyof T>(o: T, attributeName: K): T[K] {
    return o[attributeName]
  }

  setAttribute<T, K extends keyof T>(o: T, attributeName: K, newValue: T[K]): void {
    o[attributeName] = newValue
  }

}

export class SetAttributeAction<T> extends AbstractUndoAction {
  _oldValue: any
  _currState: Flame

  constructor(flame: Flame, src: T, private _key: keyof T, private _newValue: any, private _description: string) {
    super()
    this._oldValue = this.getAttribute(src, _key)
    this._currState = cloneDeep(flame)
  }

}

export class UndoManager {
  private _undoActions: UndoAction[] = []
  private _undoPosition = -1
  private _initialState: Flame

  constructor(flame: Flame) {
    this._initialState = cloneDeep(flame)
  }

  undo(): Flame {
    return this._initialState
  }

  redo(): Flame {
    return this._initialState
  }

  get undoActions() {
    return this._undoActions
  }

  registerFlameAttributeChange(flame: Flame, key: keyof Flame, newValue: any) {
    const desc = msg('Change flame attribute')
    this._undoActions.push(new SetAttributeAction(flame, flame, key, newValue, desc))
    this._undoPosition = this._undoActions.length
    console.log(this._undoPosition)
  }

  registerLayerAttributeChange(flame: Flame, layer: Layer, key: keyof Layer, newValue: any) {
    const desc = msg('Change layer attribute')
    this._undoActions.push(new SetAttributeAction(flame, layer, key, newValue, desc))
    this._undoPosition = this._undoActions.length
  }

}