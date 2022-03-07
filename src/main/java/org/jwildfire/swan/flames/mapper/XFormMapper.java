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

import org.jwildfire.create.tina.variation.VariationFunc;
import org.jwildfire.create.tina.variation.VariationFuncList;
import org.jwildfire.swan.flames.model.DParam;
import org.jwildfire.swan.flames.model.Flame;
import org.jwildfire.swan.flames.model.IParam;
import org.jwildfire.swan.flames.model.Layer;
import org.jwildfire.swan.flames.model.Variation;
import org.jwildfire.swan.flames.model.XForm;
import org.springframework.stereotype.Service;

@Service
public class XFormMapper {

  public XForm mapFromJwildfire(org.jwildfire.create.tina.base.Flame sourceFlame, org.jwildfire.create.tina.base.Layer sourceLayer, org.jwildfire.create.tina.base.XForm source) {
    XForm res = new XForm();

    res.setWeight(source.getWeight());
    res.getModifiedWeights().clear();
    for(int i=0;i<sourceLayer.getXForms().size() && i<source.getModifiedWeights().length;i++) {
      res.getModifiedWeights().add(Double.valueOf(source.getModifiedWeights()[i]));
    }
    res.setColor(source.getColor());
    res.setColorSymmetry(source.getColorSymmetry());

    res.setC00(source.getCoeff00());
    res.setC01(source.getCoeff01());
    res.setC10(source.getCoeff10());
    res.setC11(source.getCoeff11());
    res.setC20(source.getCoeff20());
    res.setC21(source.getCoeff21());

    res.setP00(source.getPostCoeff00());
    res.setP01(source.getPostCoeff01());
    res.setP10(source.getPostCoeff10());
    res.setP11(source.getPostCoeff11());
    res.setP20(source.getPostCoeff20());
    res.setP21(source.getPostCoeff21());

    for(int i=0;i<source.getVariationCount();i++) {
      org.jwildfire.create.tina.variation.Variation srcVar = source.getVariation(i);
      Variation dstVar = new Variation();
      dstVar.setAmount(srcVar.getAmount());
      dstVar.setName(srcVar.getFunc().getName());
      for (int j = 0; j < srcVar.getFunc().getParameterNames().length; j++) {
        String pName = srcVar.getFunc().getParameterNames()[j];
        Object pValue = srcVar.getFunc().getParameterValues()[j];
        if(pValue!=null) {
          if(pValue instanceof Integer) {
            dstVar.getIParams().add(new IParam(pName, (Integer)pValue));
          }
          else if(pValue instanceof Double) {
            dstVar.getDParams().add(new DParam(pName, (Double)pValue));
          }
        }
      };
      res.getVariations().add(dstVar);
    }
    return res;
  }

  public org.jwildfire.create.tina.base.XForm mapToJwildfire(Layer sourceLayer, XForm source) {
    org.jwildfire.create.tina.base.XForm res = new org.jwildfire.create.tina.base.XForm();

    res.setWeight(source.getWeight());
    for(int i=0;i<res.getModifiedWeights().length;i++) {
      res.getModifiedWeights()[i] = 0.0;
    }
    for(int i=0;i<sourceLayer.getXforms().size() && i<source.getModifiedWeights().size();i++) {
      res.getModifiedWeights()[i]=source.getModifiedWeights().get(i);
    }
    res.setColor(source.getColor());
    res.setColorSymmetry(source.getColorSymmetry());

    res.setCoeff00(source.getC00());
    res.setCoeff01(source.getC01());
    res.setCoeff10(source.getC10());
    res.setCoeff11(source.getC11());
    res.setCoeff20(source.getC20());
    res.setCoeff21(source.getC21());

    res.setPostCoeff00(source.getP00());
    res.setPostCoeff01(source.getP01());
    res.setPostCoeff10(source.getP10());
    res.setPostCoeff11(source.getP11());
    res.setPostCoeff20(source.getP20());
    res.setPostCoeff21(source.getP21());

    for(int i=0;i<source.getVariations().size();i++) {
      Variation srcVar = source.getVariations().get(i);
      org.jwildfire.create.tina.variation.Variation dstVar = new org.jwildfire.create.tina.variation.Variation();
      dstVar.setAmount(srcVar.getAmount());
      VariationFunc varFunc = VariationFuncList.getVariationFuncInstance(srcVar.getName(), true);
      dstVar.setFunc(varFunc);
      for (int j = 0; j < srcVar.getIParams().size(); j++) {
        IParam param = srcVar.getIParams().get(j);
        varFunc.setParameter(param.getName(), param.getValue());
      };
      for (int j = 0; j < srcVar.getDParams().size(); j++) {
        DParam param = srcVar.getDParams().get(j);
        varFunc.setParameter(param.getName(), param.getValue());
      };
      res.getVariations().add(dstVar);
    }
    return res;
  }
}
