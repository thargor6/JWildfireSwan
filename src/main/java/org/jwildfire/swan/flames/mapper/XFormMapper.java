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

import org.jwildfire.swan.flames.model.DParam;
import org.jwildfire.swan.flames.model.IParam;
import org.jwildfire.swan.flames.model.Variation;
import org.jwildfire.swan.flames.model.XForm;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class XFormMapper {

  public XForm mapFromJwildfire(org.jwildfire.create.tina.base.Flame sourceFlame, org.jwildfire.create.tina.base.XForm source) {
    XForm res = new XForm();

    res.setWeight(source.getWeight());
    res.getModifiedWeights().clear();
    for(int i=0;i<sourceFlame.getFirstLayer().getXForms().size() && i<source.getModifiedWeights().length;i++) {
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
}
