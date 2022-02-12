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

interface ExampleFlame {
  title: string;
  name: string;
  caption: string;
  description?: string;
  tags: string[];
}

export class GalleryStore {
  exampleFlames: ExampleFlame[] = []


  constructor() {
    makeAutoObservable(this);
    this.initialize()
  }

  private parseExampleFlame =(example: string): ExampleFlame => JSON.parse(example)

  async initialize() {
    this.exampleFlames = await GalleryEndpoint.getExampleMetaDataList().then(
       examples => examples.map(example => this.parseExampleFlame(example))
    )
  }

}

export const galleryStore = new GalleryStore()
