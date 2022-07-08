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
import {state} from "lit/decorators";

export class RenderInfoStore {
  _renderInfo = ''
  _renderProgress = 0.0
  _calculating = false

  constructor() {
    makeAutoObservable(this);
  }

  get renderInfo() {
    return this._renderInfo
  }

  set renderInfo(value) {
    this._renderInfo = value
  }

  get renderProgress() {
    return this._renderProgress
  }

  set renderProgress(value) {
    this._renderProgress = value
  }

  get calculating() {
    return this._calculating
  }

  set calculating(value) {
    this._calculating = value
  }

}

export const renderInfoStore = new RenderInfoStore();
