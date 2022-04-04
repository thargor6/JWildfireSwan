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
  SIZE_4096 = 4096,
  SIZE_8192 = 8192
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
    resolutions.set(RenderSizes.SIZE_128, [{width: 128, height: 128, displayName: '128x128 full size'}])
    resolutions.set(RenderSizes.SIZE_256, [{width: 256, height: 256, displayName: '256x256 full size'}])
    resolutions.set(RenderSizes.SIZE_512, [
      {width: 512, height: 512, displayName: '512x512 full size'},
      {width: 320, height: 256, displayName: '320x256'},
      {width: 320, height: 240, displayName: '320x240'}])
    resolutions.set(RenderSizes.SIZE_1024, [
      {width: 1024, height: 1024, displayName: '1024x1024 full size'},
      {width: 720, height: 576, displayName: '720x576'},
      {width: 1024, height: 768, displayName: '1024x768'}])
    resolutions.set(RenderSizes.SIZE_2048, [
      {width: 2048, height: 2048, displayName: '2048x2048 full size'},
      {width: 1280, height: 720, displayName: '1280x720, 720p'},
      {width: 1280, height: 1024, displayName: '1280x1024'},
      {width: 1800, height: 1200, displayName: '1800x1200, 6x4 inch, 300 dpi, 2.16 mp'},
      {width: 1920, height: 1080, displayName: '1920x1080, 1080p, Full HD'},
     ])
    resolutions.set(RenderSizes.SIZE_4096, [
      {width: 4096, height: 4096, displayName: '4096x4096 full size'},
      {width: 2272, height: 1704, displayName: '2272x1704, 7.6x5.7 inch, 300 dpi, 3.9 mp'},
      {width: 2560, height: 1440, displayName: '2560x1440, 1440p, 2K'},
      {width: 2592, height: 1944, displayName: '2592x1944, 8.6x6.5 inch, 300 dpi, 5.0 mp'},
      {width: 3072, height: 2304, displayName: '3072x2304, 10.2x7.7 inch, 300 dpi, 7.1 mp'},
      {width: 3264, height: 2448, displayName: '3264x2448, 13.6x10.2 inch, 240 dpi, 8.0'},
      {width: 3648, height: 2736, displayName: '3648x2736, 18.2x13.7 inch, 200 dpi, 10.0 mp'},
      {width: 3840, height: 2260, displayName: '3840x2160, 2160p, 4K'},
      {width: 4000, height: 3000, displayName: '4000x3000, 20x15 inch, 200 dpi, 12.1 mp'}
    ])
    resolutions.set(RenderSizes.SIZE_8192, [
      {width: 8192, height: 8192, displayName: '8192x8192 full size'},
      {width: 4416, height: 3312, displayName: '4416x3312, 22.1x16.6 inch, 200 dpi, 14.7 mp'},
      {width: 5120, height: 2880, displayName: '5120x2880, 5K'},
      {width: 5616, height: 3744, displayName: '5616x3744, 31.2 x 20.8 inch, 180 dpi, 21.0 mp'},
      {width: 7680, height: 4320, displayName: '7680x4320, 8K'}
    ])
    return resolutions
  }

  public static get defaultRenderSize() {
    return RenderSizes.SIZE_512
  }

  public static get renderSizes() {
    return [RenderSizes.SIZE_128, RenderSizes.SIZE_256, RenderSizes.SIZE_512, RenderSizes.SIZE_1024, RenderSizes.SIZE_2048, RenderSizes.SIZE_4096, RenderSizes.SIZE_8192]
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
      width: 512, height: 512, displayName: '512x512 full size'
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

  public static get defaultQualityScale() {
    return 1.5
  }

  public static get qualityScales() {
    return [0.5, 1.0, 1.5, 2.0, 4.0, 8.0, 16.0, 32.0, 64.0, 128.0]
  }

}