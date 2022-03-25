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

package org.jwildfire.swan.flames.mapper;

import org.jwildfire.create.tina.base.motion.MotionCurve;
import org.jwildfire.envelope.Envelope;
import org.jwildfire.swan.flames.model.flame.FlameParam;
import org.jwildfire.swan.flames.model.flame.FlameParamCurve;
import org.jwildfire.swan.flames.model.flame.FlameParamCurveInterpolation;
import org.jwildfire.swan.flames.model.flame.FlameParamDataType;
import org.jwildfire.swan.flames.model.flame.FlameParamType;

public class FlameParamMapper {

  public static FlameParam mapFloatParamFromJwildfire(double value, MotionCurve motionCurve) {
    if(motionCurve==null || !motionCurve.isEnabled()) {
      return new FlameParam(FlameParamType.SCALAR, FlameParamDataType.FLOAT, value, null, null);
    }
    else {
      return new FlameParam(FlameParamType.CURVE, FlameParamDataType.FLOAT, value, null, mapMotionCurveFromJWildfire(motionCurve));
    }
  }

  public static FlameParam mapIntParamFromJwildfire(int value, MotionCurve motionCurve) {
    if(motionCurve==null || !motionCurve.isEnabled()) {
      return new FlameParam(FlameParamType.SCALAR, FlameParamDataType.INT, null, value, null);
    }
    else {
      return new FlameParam(FlameParamType.CURVE, FlameParamDataType.INT, null, value, mapMotionCurveFromJWildfire(motionCurve));
    }
  }

  private static FlameParamCurve mapMotionCurveFromJWildfire(MotionCurve motionCurve) {
    return new FlameParamCurve(motionCurve.getViewXMin(),
            motionCurve.getViewXMax(), motionCurve.getViewYMin(), motionCurve.getViewYMax(),
            mapInterpolationFromJWildfire(motionCurve.getInterpolation()),
            motionCurve.getSelectedIdx(), motionCurve.getX().clone(), motionCurve.getY().clone(),
            motionCurve.isLocked());
  }

  private static FlameParamCurveInterpolation mapInterpolationFromJWildfire(Envelope.Interpolation interpolation) {
    switch(interpolation) {
      case LINEAR: return FlameParamCurveInterpolation.LINEAR;
      case BEZIER: return FlameParamCurveInterpolation.BEZIER;
      case SPLINE:
      default:
        return FlameParamCurveInterpolation.SPLINE;
    }
  }

  public static double mapFloatParamToJwildfire(FlameParam param, MotionCurve destCurve) {
    if(param.getParamType()==FlameParamType.SCALAR) {
      if(destCurve!=null) {
        destCurve.setEnabled(false);
      }
    }
    else {
      if (destCurve != null) {
        applyMotionCurveToJWildfire(param.getCurve(), destCurve);
        destCurve.setEnabled(true);
      }
    }
    return param.getFloatScalar() != null ? param.getFloatScalar().floatValue() : 0.0;
  }

  public static int mapIntParamToJwildfire(FlameParam param, MotionCurve destCurve) {
    if(param.getParamType()==FlameParamType.SCALAR) {
      if(destCurve!=null) {
        destCurve.setEnabled(false);
      }
    }
    else {
      if (destCurve != null) {
        applyMotionCurveToJWildfire(param.getCurve(), destCurve);
        destCurve.setEnabled(true);
      }
    }
    return param.getIntScalar() != null ? param.getIntScalar() : 0;
  }

  private static void applyMotionCurveToJWildfire(FlameParamCurve source, MotionCurve dest) {
    dest.setViewXMin(source.getViewXMin());
    dest.setViewXMax(source.getViewXMax());
    dest.setViewYMin(source.getViewYMin());
    dest.setViewYMax(source.getViewYMax());
    dest.setInterpolation(mapInterpolationToJWildfire(source.getInterpolation()));
    dest.setSelectedIdx(source.getSelectedIdx());
    dest.setPoints(source.getX().clone(), source.getY().clone());
    dest.setLocked(source.isLocked());
  }

  private static Envelope.Interpolation mapInterpolationToJWildfire(FlameParamCurveInterpolation interpolation) {
    switch(interpolation) {
      case LINEAR: return Envelope.Interpolation.LINEAR;
      case BEZIER: return Envelope.Interpolation.BEZIER;
      case SPLINE:
      default:
        return Envelope.Interpolation.SPLINE;
    }
  }

}
