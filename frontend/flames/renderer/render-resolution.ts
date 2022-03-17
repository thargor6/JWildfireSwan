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

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderResolution {
  width: number;
  height: number;
  displayName: string;
}

enum RenderSizes {
  SIZE_128 = 128,
  SIZE_256 = 256,
  SIZE_512 = 512,
  SIZE_1024 = 1024,
  SIZE_2048 = 2048,
  SIZE_4096 = 4096
}

enum SwarmSizes {
  SIZE_8 = 8,
  SIZE_16 = 16,
  SIZE_32 = 32,
  SIZE_64 = 64,
  SIZE_128 = 128,
  SIZE_256 = 256,
  SIZE_512 = 512,
  SIZE_1024 = 1024,
  SIZE_2048 = 2048
}

export class RenderResolutions {
  private static resolutions: Map<number, Array<RenderResolution>> = RenderResolutions.initResoltions()

  private static initResoltions() {
    const resolutions = new Map<number, Array<RenderResolution>>()
    resolutions.set(RenderSizes.SIZE_128, [{width: 128, height: 128, displayName: '128x128'}])
    resolutions.set(RenderSizes.SIZE_256, [{width: 256, height: 256, displayName: '256x256'}])
    resolutions.set(RenderSizes.SIZE_512, [{width: 512, height: 512, displayName: '512x512'}, {width: 320, height: 256, displayName: '320x256'}])

    resolutions.set(RenderSizes.SIZE_1024, [{width: 1024, height: 1024, displayName: '1024x1024'}])
    resolutions.set(RenderSizes.SIZE_2048, [
      {width: 2048, height: 2048, displayName: '2048x2048'}, {width: 1920, height: 1080, displayName: '1920x1080'},
     ])

    resolutions.set(RenderSizes.SIZE_4096, [{width: 4096, height: 4096, displayName: '4096x4096'}])
    return resolutions
  }

  public static get defaultRenderSize() {
    return RenderSizes.SIZE_512
  }

  public static get renderSizes() {
    return [RenderSizes.SIZE_128, RenderSizes.SIZE_256, RenderSizes.SIZE_512, RenderSizes.SIZE_1024, RenderSizes.SIZE_2048, RenderSizes.SIZE_4096]
  }

  public static get defaultSwarmSize() {
    return SwarmSizes.SIZE_256
  }

  public static get swarmSizes() {
     return [SwarmSizes.SIZE_8, SwarmSizes.SIZE_16, SwarmSizes.SIZE_32, SwarmSizes.SIZE_64, SwarmSizes.SIZE_128,
       SwarmSizes.SIZE_256, SwarmSizes.SIZE_512, SwarmSizes.SIZE_1024, SwarmSizes.SIZE_2048]
  }

  public static get defaultRenderResolution(): RenderResolution {
    return {
      width: 512, height: 512, displayName: '512x512'
    }
  }

  public static getRenderResolutions(renderSize: RenderSizes) {
    return RenderResolutions.resolutions.get(renderSize)
  }

  public static getCropRegion(renderSize: RenderSizes | undefined, cropSize: RenderResolution | undefined) {
    if(!renderSize || !cropSize || (cropSize.width === renderSize && cropSize.height === renderSize)) {
      return undefined
    }
    return {
      x: (renderSize - cropSize.width) / 2,
      y: (renderSize - cropSize.height) / 2,
      width: cropSize.width,
      height: cropSize.height
    }
  }

  static findRenderResolutionByName(renderSize: RenderSizes, displayName: string) {
    return RenderResolutions.resolutions.get(renderSize)!.find(resolution => resolution.displayName === displayName)!
  }
}