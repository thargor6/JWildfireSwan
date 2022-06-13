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
import {registerVars_Complex} from "Frontend/flames/renderer/variations/variation-shaders-2d-complex";
import {registerVars_Waves} from "Frontend/flames/renderer/variations/variation-shaders-waves";
import {registerVar_Synth} from "Frontend/flames/renderer/variations/variation-shaders-synth";
import {registerVars_Blur} from "Frontend/flames/renderer/variations/variation-shaders-blur";
import {registerVars_2D_PartS} from "Frontend/flames/renderer/variations/variation-shaders-2d-partS";
import {registerVars_Plot} from "Frontend/flames/renderer/variations/variation-shaders-plot";
import {registerVars_2D_PartC} from "Frontend/flames/renderer/variations/variation-shaders-2d-partC";
import {registerVars_2D_PartD} from "Frontend/flames/renderer/variations/variation-shaders-2d-partD";
import {registerVars_2D_PartG} from "Frontend/flames/renderer/variations/variation-shaders-2d-partG";
import {registerVars_2D_PartP} from "Frontend/flames/renderer/variations/variation-shaders-2d-partP";
import {registerVars_2D_PartT} from "Frontend/flames/renderer/variations/variation-shaders-2d-partT";
import {registerVars_3D_PartH} from "Frontend/flames/renderer/variations/variation-shaders-3d-partH";
import {registerVars_3D_PartQ} from "Frontend/flames/renderer/variations/variation-shaders-3d-partQ";
import {registerVars_2D_PartA} from "Frontend/flames/renderer/variations/variation-shaders-2d-partA";
import {registerVars_2D_PartK} from "Frontend/flames/renderer/variations/variation-shaders-2d-partK";
import {registerVars_3D_PartA} from "Frontend/flames/renderer/variations/variation-shaders-3d-partA";
import {registerVars_ZTransforms} from "Frontend/flames/renderer/variations/variation-shaders-ztransform";

export function registerVars_All() {
  registerVars_2D_PartA()
  registerVars_2D_PartC()
  registerVars_2D_PartD()
  registerVars_2D_PartG()
  registerVars_2D_PartK()
  registerVars_2D_PartP()
  registerVars_2D_PartS()
  registerVars_2D_PartT()
  registerVars_Blur()
  registerVars_Complex()
  registerVars_Waves()
  registerVar_Synth()
  registerVars_3D_PartA()
  registerVars_3D_PartH()
  registerVars_3D_PartQ()
  registerVars_ZTransforms()
  registerVars_Plot()
}