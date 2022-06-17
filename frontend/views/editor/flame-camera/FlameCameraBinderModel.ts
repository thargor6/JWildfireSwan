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

// @ts-nocheck
import {ObjectModel,StringModel,NumberModel,ArrayModel,BooleanModel,Required,ModelValue,_getPropertyModel} from '@hilla/form';

import {Email,Null,NotNull,NotEmpty,NotBlank,AssertTrue,AssertFalse,Negative,NegativeOrZero,Positive,PositiveOrZero,Size,Past,Future,Digits,Min,Max,Pattern,DecimalMin,DecimalMax} from '@hilla/form';
import {FlameCameraModel} from "Frontend/views/editor/flame-camera/FlameCameraModel";

export default class FlameCameraBinderModel<T extends FlameCameraModel = FlameCameraModel> extends ObjectModel<T> {
  static createEmptyValue: () => Flame;

  get camRoll(): NumberModel {
    return this[_getPropertyModel]('camRoll', NumberModel, [false]);
  }

  get camPitch(): NumberModel {
    return this[_getPropertyModel]('camPitch', NumberModel, [false]);
  }

  get camYaw(): NumberModel {
    return this[_getPropertyModel]('camYaw', NumberModel, [false]);
  }

  get camBank(): NumberModel {
    return this[_getPropertyModel]('camBank', NumberModel, [false]);
  }

  get camPerspective(): NumberModel {
    return this[_getPropertyModel]('camPerspective', NumberModel, [false]);
  }

  get centreX(): NumberModel {
    return this[_getPropertyModel]('centreX', NumberModel, [false]);
  }

  get centreY(): NumberModel {
    return this[_getPropertyModel]('centreY', NumberModel, [false]);
  }

  get camZoom(): NumberModel {
    return this[_getPropertyModel]('camZoom', NumberModel, [false]);
  }
}

