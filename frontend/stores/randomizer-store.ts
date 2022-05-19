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
import {registerVars_2D_PartA} from "Frontend/flames/renderer/variations/variation-shaders-2d-partA";
import {registerVars_2D_PartK} from "Frontend/flames/renderer/variations/variation-shaders-2d-partK";
import {registerVars_3D} from "Frontend/flames/renderer/variations/variation-shaders-3d";
import {registerVars_ZTransforms} from "Frontend/flames/renderer/variations/variation-shaders-ztransform";
import {Flame} from "Frontend/flames/model/flame";
import {GalleryEndpoint} from "Frontend/generated/endpoints";
import {registerVars_Complex} from "Frontend/flames/renderer/variations/variation-shaders-2d-complex";
import {registerVars_Waves} from "Frontend/flames/renderer/variations/variation-shaders-waves";
import {registerVar_Synth} from "Frontend/flames/renderer/variations/variation-shaders-synth";
import {registerVars_Blur} from "Frontend/flames/renderer/variations/variation-shaders-blur";
import {registerVars_2D_PartS} from "Frontend/flames/renderer/variations/variation-shaders-2d-partS";
import {ExampleFlame, parseExampleFlame, sortExamples, SortOrder} from "Frontend/stores/example-flames";
import {registerVars_Plot} from "Frontend/flames/renderer/variations/variation-shaders-plot";

type OnInitCallback = () => void

export class RandomFlame {
  subBatch = new Array<RandomFlame>()

  constructor(private _flame: Flame, private _imgSrc: string) {
  }

  get flame() {
    return this._flame
  }

  get imgSrc() {
    return this._imgSrc
  }

}

export class RandomizerStore {
  calculating = false
  lastError = ''
  currFlame = new Flame()
  currRndStackIdx = 0
  currBaseFlamename: string | undefined = undefined
  cancelSignalled = false

  randomFlames = new Array<RandomFlame>()

  constructor() {
    makeAutoObservable(this);
  }

  getFlameByName(name: string): RandomFlame | undefined {
    return this.randomFlames.find( f => f.flame.name === name)
  }

  getFlameIdxByName(name: string): number {
    const flame = this.getFlameByName(name)
    return flame ? this.randomFlames.indexOf(flame) : -1
  }

  hasFlameWithName(name: string) {
    return this.getFlameByName(name) != undefined
  }

  deleteFlame(flameName: string) {
    const flameIdx = this.getFlameIdxByName(flameName)
    if (flameIdx>=0) {
      let newFlames = [...this.randomFlames]
      newFlames.splice(flameIdx, 1)
      this.randomFlames = newFlames
    }
  }

  addRandomFlame(flame: Flame, imgSrc: string) {
    // ensure unique name in store
    let flameName = flame.name
    let counter = 1
    while(this.hasFlameWithName(flameName)) {
      flameName = flame.name + '_' + counter++;
    }
    // add the flame and image to the store
    const rndFlame = new RandomFlame(flame, imgSrc)
    rndFlame.flame.name = flameName
    const rndFlames = [rndFlame, ...randomizerStore.randomFlames]
    randomizerStore.randomFlames = [...rndFlames]
  }

  addSubRandomFlame(parentFlameName: string, flame: Flame, imgSrc: string, maxSubBatchSize: number) {
    const parentFlame = this.getFlameByName(parentFlameName)
    if(!parentFlame) {
      console.log("Parent flame " + parentFlameName + "not found")
    }
    else {
      // ensure unique name in store
      let flameName = flame.name
      let counter = 1
      while (this.hasSubFlameWithName(parentFlame, flameName)) {
        flameName = flame.name + '_' + counter++;
      }
      // add the flame and image to the store
      const rndFlame = new RandomFlame(flame, imgSrc)
      rndFlame.flame.name = flameName
      let rndSubFlames = [rndFlame, ...parentFlame.subBatch]
      if(maxSubBatchSize>0 && rndSubFlames.length>maxSubBatchSize) {
        rndSubFlames = rndSubFlames.slice(0, maxSubBatchSize)
      }
      parentFlame.subBatch = [...rndSubFlames]
      randomizerStore.randomFlames = [...randomizerStore.randomFlames]
    }
  }

  private hasSubFlameWithName(parentFlame: RandomFlame, flameName: string) {
    return parentFlame.subBatch.find( r=> r.flame.name === flameName) != undefined
  }
}

export const randomizerStore = new RandomizerStore()
