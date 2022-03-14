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
import {registerVars_2D_PartA} from "Frontend/flames/renderer/variations/variation-shaders-2d-partA";
import {registerVars_2D_PartK} from "Frontend/flames/renderer/variations/variation-shaders-2d-partK";
import {registerVars_3D} from "Frontend/flames/renderer/variations/variation-shaders-3d";
import {registerVars_ZTransforms} from "Frontend/flames/renderer/variations/variation-shaders-ztransform";
import {Flame} from "Frontend/flames/model/flame";
import {FlameRenderer} from "Frontend/flames/renderer/flame-renderer";
import {GalleryEndpoint} from "Frontend/generated/endpoints";
import {registerVars_Complex} from "Frontend/flames/renderer/variations/variation-shaders-2d-complex";
import {registerVars_Waves} from "Frontend/flames/renderer/variations/variation-shaders-waves";
import {registerVar_Synth} from "Frontend/flames/renderer/variations/variation-shaders-synth";
import {registerVars_Blur} from "Frontend/flames/renderer/variations/variation-shaders-blur";
import {registerVars_2D_PartS} from "Frontend/flames/renderer/variations/variation-shaders-2d-partS";

export interface RendererFlame {
  finished: boolean;
  elapsedTimeInSeconds: number;
  uuid: string;
  filename: string;
  flame: Flame;
}

export class RendererStore {
  rendering = false
  renderProgress = 0.0
  lastError = ''
  renderer!: FlameRenderer
  flames: RendererFlame[] = []
  selectedFlames: RendererFlame[] = [];

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

}

export const rendererStore = new RendererStore()
