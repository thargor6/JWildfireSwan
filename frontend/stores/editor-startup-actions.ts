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

import {randomizerStore} from "./randomizer-store";
import {editorStore} from "./editor-store";
import {FlameMapper} from "../flames/model/mapper/flame-mapper";
import {FlamesEndpoint} from "Frontend/generated/endpoints";
import {renderInfoStore} from "./render-info-store";

export interface StartupAction {
  execute(): boolean
}

export class EmptyAction implements StartupAction {
  execute(): boolean {
    return false
  }

}

export class GenerateRandomFlameAction implements StartupAction {
  private executed = false

  constructor(private generatorName: string) {
    //
  }

  execute(): boolean {
    if(!this.executed) {
      renderInfoStore.calculating = true
      editorStore.lastError = ''
      try {
        FlamesEndpoint.generateRandomFlame(editorStore.variations).then(
          randomFlame => {
            editorStore.currFlame = FlameMapper.mapFromBackend(randomFlame.flame)
          }
        ).catch(err=> {
          renderInfoStore.calculating = false
          editorStore.lastError = err
        })
      }
      finally {
        renderInfoStore.calculating = false
      }
      this.executed = true
      return true
    }
    else {
      return false
    }
  }

}

export class LoadRandomFlameAction implements StartupAction {
  private executed = false

  constructor(private flameName: string) {
    //
  }

  execute(): boolean {
    if(!this.executed) {
      const rndFlame = randomizerStore.getFlameByName(this.flameName)
      if(!rndFlame) {
        console.log(`random flame #${this.flameName}# not found`)
      }
      else {
        editorStore.currFlame = rndFlame.flame
      }
      this.executed = true
      return true
    }
    else {
      return true
    }
  }

}

export class LoadRandomSubFlameAction implements StartupAction {
  private executed = false

  constructor(private parentName: string, private subFlameName: string) {
    //
  }

  execute(): boolean {
    if(!this.executed) {
      let rndFlame = randomizerStore.getSubFlameByName(this.parentName, this.subFlameName)
      if(!rndFlame) {
        console.log(`random flame #${this.parentName}/${this.subFlameName}# not found`)
      }
      else {
        editorStore.currFlame = rndFlame.flame
      }
      this.executed = true
      return true
    }
    else {
      return false
    }
  }

}

class StartupActionHolder {
  constructor(public action: StartupAction) {
  }
}

export const startupActionHolder = new StartupActionHolder(new EmptyAction())