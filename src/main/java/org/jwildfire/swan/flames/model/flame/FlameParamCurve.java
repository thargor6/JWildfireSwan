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
package org.jwildfire.swan.flames.model.flame;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.jwildfire.create.tina.base.motion.MotionCurve;
import org.jwildfire.envelope.Envelope;
import dev.hilla.Nonnull;

@Data
@AllArgsConstructor
// inherits all the properties from a MotionCurve from JWildfire, in order to be able to map between both
public class FlameParamCurve {
  int viewXMin;
  int viewXMax = 70;
  double viewYMin = -120.0D;
  double viewYMax = 120.0D;
  @Nonnull FlameParamCurveInterpolation interpolation;
  int selectedIdx;
  private int[] x;
  private double[] y;
  private boolean locked;
}
