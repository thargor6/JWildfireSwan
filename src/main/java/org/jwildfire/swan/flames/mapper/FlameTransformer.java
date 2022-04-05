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

import org.jwildfire.base.Prefs;
import org.jwildfire.base.mathlib.MathLib;
import org.jwildfire.create.tina.base.Flame;
import org.jwildfire.create.tina.base.Layer;
import org.jwildfire.create.tina.base.PostSymmetryType;
import org.jwildfire.create.tina.base.XForm;
import org.jwildfire.create.tina.base.XYZPoint;
import org.jwildfire.create.tina.random.AbstractRandomGenerator;
import org.jwildfire.create.tina.random.MarsagliaRandomGenerator;
import org.jwildfire.create.tina.render.FlameRenderer;
import org.jwildfire.create.tina.variation.FlameTransformationContext;
import org.jwildfire.create.tina.variation.PostAxisSymmetryWFFunc;
import org.jwildfire.create.tina.variation.PostPointSymmetryWFFunc;
import org.jwildfire.create.tina.variation.Variation;
import org.jwildfire.create.tina.variation.VariationFunc;
import org.jwildfire.create.tina.variation.VariationFuncList;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FlameTransformer {
  private static FlameTransformationContext ctx;

  // apply some Swan-specific changes
  public Flame transformFlame(Flame pFlame) {
    Flame flame = pFlame.makeCopy();

    // emulate the preserveZ-feature by adding zscale-transforms
    if(flame.isPreserveZ()) {
      for(Layer layer: flame.getLayers()) {
        for(XForm xForm: layer.getXForms()) {
          processXFormPreserveZ(layer, xForm);
        }
        for(XForm xForm: layer.getFinalXForms()) {
          processXFormPreserveZ(layer, xForm);
        }
      }
      flame.setPreserveZ(false);
    }
    return flame;
  }

  private void processXFormPreserveZ(Layer layer, XForm xForm) {
    double preserveAmount = 0.0;
    final String zScaleVarName = "zscale";
    int zScaleIdx = -1;
    for(int i=0;i<xForm.getVariationCount();i++) {
      Variation variation = xForm.getVariation(i);
      if(zScaleIdx<0 && zScaleVarName.equals(variation.getFunc().getName())) {
        zScaleIdx = i;
      }
      if(preservesZCoordinate(layer, xForm, variation)) {
        preserveAmount += variation.getAmount();
      }
    }
    if(MathLib.fabs(preserveAmount)>MathLib.EPSILON) {
      if(zScaleIdx>=0) {
        Variation zScale = xForm.getVariation(zScaleIdx);
        zScale.setAmount(zScale.getAmount() + preserveAmount);
      }
      else {
        xForm.addVariation(preserveAmount, VariationFuncList.getVariationFuncInstance(zScaleVarName, true));
      }
    }
  }

  private static Map<String, Boolean> preserveZCache = new HashMap<>();

  private boolean preservesZCoordinate(Layer layer, XForm xForm, Variation variation) {
    Boolean preserveZ = preserveZCache.get(variation.getFunc().getName());
    if(preserveZ==null) {
      try {
        final double x = 0.5;
        final double y = 0.25;
        final double z = 23.45;
        {
          FlameTransformationContext ctx = createFlameTransformationContext();
          variation.getFunc().initOnce(ctx, layer, xForm, variation.getAmount());
          variation.getFunc().init(ctx, layer, xForm, variation.getAmount());

          XYZPoint affine1TP = new XYZPoint();
          affine1TP.x = x;
          affine1TP.y = y;
          affine1TP.z = z;
          XYZPoint affine2TP = affine1TP.makeCopy();

          XYZPoint var1TP = new XYZPoint();
          XYZPoint var2TP = new XYZPoint();

          ctx.setPreserveZCoordinate(true);
          variation.transform(ctx, xForm, affine1TP, var1TP);
          ctx.setPreserveZCoordinate(false);
          variation.transform(ctx, xForm, affine2TP, var2TP);
          preserveZ = MathLib.fabs(var1TP.z - z * variation.getAmount()) < MathLib.EPSILON && MathLib.fabs(var2TP.z) < MathLib.EPSILON;
          // System.err.println("VAR: " + variation.getFunc().getName()+" " + var1TP.z +" " + var2TP.z + " " + preserveZ);
        }
      }
      catch(Exception ex) {
        // some more comlicated variation which failes outside real rendering,
        // let it ignore for now
        preserveZ = Boolean.FALSE;
        ex.printStackTrace();
      }
      preserveZCache.put(variation.getFunc().getName(), preserveZ);
    }
    return preserveZ;
  }

  private void addPostSymmetryVariation(Flame flame, VariationFunc func, double amount) {
    XForm xForm = new XForm();
    xForm.addVariation(1.0, VariationFuncList.getVariationFuncInstance("linear3D", true));
    xForm.addVariation(amount, func);
    for(Layer layer: flame.getLayers()) {
      layer.getFinalXForms().add(xForm);
    }
  }

  private FlameTransformationContext createFlameTransformationContext() {
    FlameRenderer renderer = new FlameRenderer(new Flame(), Prefs.getPrefs(), false, true);
    AbstractRandomGenerator randGen = new MarsagliaRandomGenerator();
    return new FlameTransformationContext(renderer, randGen,1,1);
  }
}


/*
  @Override
  public void transform(FlameTransformationContext pContext, XForm pXForm, XYZPoint pAffineTP, XYZPoint pVarTP, double pAmount) {
    pVarTP.x += pAmount * pAffineTP.x;
    pVarTP.y += pAmount * pAffineTP.y;
    if (pContext.isPreserveZCoordinate()) {
      pVarTP.z += pAmount * pAffineTP.z;
    }
  }
 */
