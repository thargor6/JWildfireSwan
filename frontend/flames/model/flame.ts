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

import {FlameParameter, Parameters} from "Frontend/flames/model/parameters";


export class XForm {
    public c00: FlameParameter = Parameters.number(1.0);
    public c01: FlameParameter = Parameters.number(0.0);
    public c10: FlameParameter = Parameters.number(0.0);
    public c11: FlameParameter = Parameters.number(1.0);
    public c20: FlameParameter = Parameters.number(0.0);
    public c21: FlameParameter = Parameters.number(0.0);
    public color: FlameParameter = Parameters.number(0.5);
    public symmetry: FlameParameter = Parameters.number(0.0);
    public weight: FlameParameter = Parameters.number(1.0);
}

export class Flame {
    public brightness = Parameters.number(1.0);
    private _xforms = new Array<XForm>();
    public get xforms() {
        return this._xforms;
    }
}