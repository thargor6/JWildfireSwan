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
import {Flame} from "Frontend/flames/model/flame";
import {FlameRenderer} from "Frontend/flames/renderer/flame-renderer";
import {SharedRenderContext} from "Frontend/flames/renderer/shared-render-context";

export interface BatchRendererFlame {
  finished: boolean;
  elapsedTimeInSeconds: number;
  uuid: string;
  filename: string;
  flame: Flame;
}

export class BatchRendererStore {
  rendering = false
  renderProgress = 0.0
  lastError = ''
  renderer!: FlameRenderer
  flames: BatchRendererFlame[] = []
  selectedFlames: BatchRendererFlame[] = [];
  cancelSignalled = false
  renderFlameTotalCount = 0
  sharedRenderCtx = new SharedRenderContext()

  constructor() {
    makeAutoObservable(this);
  }

  hasFlameWithUuid(uuid: string) {
    return this.flames.find( flame => flame.uuid === uuid) != undefined
  }

  addFlameWithUuid = (uuid: string, filename: string, flame: Flame)=> {
    this.flames = [...this.flames, {
      finished: false,
      elapsedTimeInSeconds: 0,
      uuid: uuid,
      filename: filename,
      flame: flame
    }]
  }

  updateFlameStatus = (uuid: string, finished: boolean, elapsedTimeInSeconds: number) => {
    const flameIdx = this.flames.findIndex(flame => flame.uuid === uuid);
    if(flameIdx>=0) {
      const flame = this.flames[flameIdx]
      const newFlame = {
        finished: finished,
        elapsedTimeInSeconds: elapsedTimeInSeconds,
        uuid: uuid,
        filename: flame.filename,
        flame: flame.flame
      }
      this.flames = [...this.flames.slice(0, flameIdx), newFlame, ...this.flames.slice(flameIdx + 1)]
    }
  }

  clearFlames() {
    this.flames = []
  }
}

export const batchRendererStore = new BatchRendererStore()
