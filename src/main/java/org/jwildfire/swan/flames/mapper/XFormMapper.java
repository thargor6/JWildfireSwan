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
import org.jwildfire.swan.flames.model.flame.FlameParamDataType;
import org.jwildfire.swan.flames.model.flame.FlameParamType;
import org.jwildfire.swan.flames.model.flame.Layer;
import org.jwildfire.swan.flames.model.flame.Variation;
import org.jwildfire.swan.flames.model.flame.VariationParam;
import org.jwildfire.swan.flames.model.flame.XForm;
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

    res.setXyC00(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYCoeff00(), source.getXYCoeff00Curve()));
    res.setXyC01(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYCoeff01(), source.getXYCoeff01Curve()));
    res.setXyC10(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYCoeff10(), source.getXYCoeff10Curve()));
    res.setXyC11(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYCoeff11(), source.getXYCoeff11Curve()));
    res.setXyC20(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYCoeff20(), source.getXYCoeff20Curve()));
    res.setXyC21(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYCoeff21(), source.getXYCoeff21Curve()));
    res.setXyRotate(FlameParamMapper.mapFloatParamFromJwildfire(0.0, source.getXYRotateCurve()));
    res.setXyScale(FlameParamMapper.mapFloatParamFromJwildfire(1.0, source.getXYScaleCurve()));

    res.setYzC00(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZCoeff00(), source.getYZCoeff00Curve()));
    res.setYzC01(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZCoeff01(), source.getYZCoeff01Curve()));
    res.setYzC10(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZCoeff10(), source.getYZCoeff10Curve()));
    res.setYzC11(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZCoeff11(), source.getYZCoeff11Curve()));
    res.setYzC20(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZCoeff20(), source.getYZCoeff20Curve()));
    res.setYzC21(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZCoeff21(), source.getYZCoeff21Curve()));
    res.setYzRotate(FlameParamMapper.mapFloatParamFromJwildfire(0.0, source.getYZRotateCurve()));
    res.setYzScale(FlameParamMapper.mapFloatParamFromJwildfire(1.0, source.getYZScaleCurve()));

    res.setZxC00(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXCoeff00(), source.getZXCoeff00Curve()));
    res.setZxC01(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXCoeff01(), source.getZXCoeff01Curve()));
    res.setZxC10(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXCoeff10(), source.getZXCoeff10Curve()));
    res.setZxC11(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXCoeff11(), source.getZXCoeff11Curve()));
    res.setZxC20(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXCoeff20(), source.getZXCoeff20Curve()));
    res.setZxC21(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXCoeff21(), source.getZXCoeff21Curve()));
    res.setZxRotate(FlameParamMapper.mapFloatParamFromJwildfire(0.0, source.getZXRotateCurve()));
    res.setZxScale(FlameParamMapper.mapFloatParamFromJwildfire(1.0, source.getZXScaleCurve()));

    res.setXyP00(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYPostCoeff00(), source.getXYPostCoeff00Curve()));
    res.setXyP01(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYPostCoeff01(), source.getXYPostCoeff01Curve()));
    res.setXyP10(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYPostCoeff10(), source.getXYPostCoeff10Curve()));
    res.setXyP11(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYPostCoeff11(), source.getXYPostCoeff11Curve()));
    res.setXyP20(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYPostCoeff20(), source.getXYPostCoeff20Curve()));
    res.setXyP21(FlameParamMapper.mapFloatParamFromJwildfire(source.getXYPostCoeff21(), source.getXYPostCoeff21Curve()));
    res.setXyPRotate(FlameParamMapper.mapFloatParamFromJwildfire(0.0, source.getXYPostRotateCurve()));
    res.setXyPScale(FlameParamMapper.mapFloatParamFromJwildfire(1.0, source.getXYPostScaleCurve()));

    res.setYzP00(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZPostCoeff00(), source.getYZPostCoeff00Curve()));
    res.setYzP01(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZPostCoeff01(), source.getYZPostCoeff01Curve()));
    res.setYzP10(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZPostCoeff10(), source.getYZPostCoeff10Curve()));
    res.setYzP11(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZPostCoeff11(), source.getYZPostCoeff11Curve()));
    res.setYzP20(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZPostCoeff20(), source.getYZPostCoeff20Curve()));
    res.setYzP21(FlameParamMapper.mapFloatParamFromJwildfire(source.getYZPostCoeff21(), source.getYZPostCoeff21Curve()));
    res.setYzPRotate(FlameParamMapper.mapFloatParamFromJwildfire(0.0, source.getYZPostRotateCurve()));
    res.setYzPScale(FlameParamMapper.mapFloatParamFromJwildfire(1.0, source.getYZPostScaleCurve()));

    res.setZxP00(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXPostCoeff00(), source.getZXPostCoeff00Curve()));
    res.setZxP01(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXPostCoeff01(), source.getZXPostCoeff01Curve()));
    res.setZxP10(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXPostCoeff10(), source.getZXPostCoeff10Curve()));
    res.setZxP11(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXPostCoeff11(), source.getZXPostCoeff11Curve()));
    res.setZxP20(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXPostCoeff20(), source.getZXPostCoeff20Curve()));
    res.setZxP21(FlameParamMapper.mapFloatParamFromJwildfire(source.getZXPostCoeff21(), source.getZXPostCoeff21Curve()));
    res.setZxPRotate(FlameParamMapper.mapFloatParamFromJwildfire(0.0, source.getZXPostRotateCurve()));
    res.setZxPScale(FlameParamMapper.mapFloatParamFromJwildfire(1.0, source.getZXPostScaleCurve()));

    for(int i=0;i<source.getVariationCount();i++) {
      org.jwildfire.create.tina.variation.Variation srcVar = source.getVariation(i);
      Variation dstVar = new Variation();
      dstVar.setAmount(FlameParamMapper.mapFloatParamFromJwildfire(srcVar.getAmount(), srcVar.getAmountCurve()));
      dstVar.setName(srcVar.getFunc().getName());
      for (int j = 0; j < srcVar.getFunc().getParameterNames().length; j++) {
        String pName = srcVar.getFunc().getParameterNames()[j];
        Object pValue = srcVar.getFunc().getParameterValues()[j];
        if(pValue!=null) {
          if(pValue instanceof Integer) {
            dstVar.getParams().add(new VariationParam(pName, FlameParamMapper.mapIntParamFromJwildfire((Integer)pValue, srcVar.getMotionCurve(pName))));
          }
          else if(pValue instanceof Double) {
            dstVar.getParams().add(new VariationParam(pName, FlameParamMapper.mapFloatParamFromJwildfire((Double)pValue, srcVar.getMotionCurve(pName))));
          }
        }
      };
      // TODO manage also resource parameters
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

    res.setXYCoeff00(FlameParamMapper.mapFloatParamToJwildfire(source.getXyC00(), res.getXYCoeff00Curve()));
    res.setXYCoeff01(FlameParamMapper.mapFloatParamToJwildfire(source.getXyC01(), res.getXYCoeff01Curve()));
    res.setXYCoeff10(FlameParamMapper.mapFloatParamToJwildfire(source.getXyC10(), res.getXYCoeff10Curve()));
    res.setXYCoeff11(FlameParamMapper.mapFloatParamToJwildfire(source.getXyC11(), res.getXYCoeff11Curve()));
    res.setXYCoeff20(FlameParamMapper.mapFloatParamToJwildfire(source.getXyC20(), res.getXYCoeff20Curve()));
    res.setXYCoeff21(FlameParamMapper.mapFloatParamToJwildfire(source.getXyC21(), res.getXYCoeff21Curve()));
    FlameParamMapper.mapFloatParamToJwildfire(source.getXyRotate(), res.getXYRotateCurve());
    FlameParamMapper.mapFloatParamToJwildfire(source.getXyScale(), res.getXYScaleCurve());

    res.setYZCoeff00(FlameParamMapper.mapFloatParamToJwildfire(source.getYzC00(), res.getYZCoeff00Curve()));
    res.setYZCoeff01(FlameParamMapper.mapFloatParamToJwildfire(source.getYzC01(), res.getYZCoeff01Curve()));
    res.setYZCoeff10(FlameParamMapper.mapFloatParamToJwildfire(source.getYzC10(), res.getYZCoeff10Curve()));
    res.setYZCoeff11(FlameParamMapper.mapFloatParamToJwildfire(source.getYzC11(), res.getYZCoeff11Curve()));
    res.setYZCoeff20(FlameParamMapper.mapFloatParamToJwildfire(source.getYzC20(), res.getYZCoeff20Curve()));
    res.setYZCoeff21(FlameParamMapper.mapFloatParamToJwildfire(source.getYzC21(), res.getYZCoeff21Curve()));
    FlameParamMapper.mapFloatParamToJwildfire(source.getYzRotate(), res.getYZRotateCurve());
    FlameParamMapper.mapFloatParamToJwildfire(source.getYzScale(), res.getYZScaleCurve());

    res.setZXCoeff00(FlameParamMapper.mapFloatParamToJwildfire(source.getZxC00(), res.getZXCoeff00Curve()));
    res.setZXCoeff01(FlameParamMapper.mapFloatParamToJwildfire(source.getZxC01(), res.getZXCoeff01Curve()));
    res.setZXCoeff10(FlameParamMapper.mapFloatParamToJwildfire(source.getZxC10(), res.getZXCoeff10Curve()));
    res.setZXCoeff11(FlameParamMapper.mapFloatParamToJwildfire(source.getZxC11(), res.getZXCoeff11Curve()));
    res.setZXCoeff20(FlameParamMapper.mapFloatParamToJwildfire(source.getZxC20(), res.getZXCoeff20Curve()));
    res.setZXCoeff21(FlameParamMapper.mapFloatParamToJwildfire(source.getZxC21(), res.getZXCoeff21Curve()));
    FlameParamMapper.mapFloatParamToJwildfire(source.getZxRotate(), res.getZXRotateCurve());
    FlameParamMapper.mapFloatParamToJwildfire(source.getZxScale(), res.getZXScaleCurve());

    res.setXYPostCoeff00(FlameParamMapper.mapFloatParamToJwildfire(source.getXyP00(), res.getXYPostCoeff00Curve()));
    res.setXYPostCoeff01(FlameParamMapper.mapFloatParamToJwildfire(source.getXyP01(), res.getXYPostCoeff01Curve()));
    res.setXYPostCoeff10(FlameParamMapper.mapFloatParamToJwildfire(source.getXyP10(), res.getXYPostCoeff10Curve()));
    res.setXYPostCoeff11(FlameParamMapper.mapFloatParamToJwildfire(source.getXyP11(), res.getXYPostCoeff11Curve()));
    res.setXYPostCoeff20(FlameParamMapper.mapFloatParamToJwildfire(source.getXyP20(), res.getXYPostCoeff20Curve()));
    res.setXYPostCoeff21(FlameParamMapper.mapFloatParamToJwildfire(source.getXyP21(), res.getXYPostCoeff21Curve()));
    FlameParamMapper.mapFloatParamToJwildfire(source.getXyPRotate(), res.getXYPostRotateCurve());
    FlameParamMapper.mapFloatParamToJwildfire(source.getXyPScale(), res.getXYPostScaleCurve());

    res.setYZPostCoeff00(FlameParamMapper.mapFloatParamToJwildfire(source.getYzP00(), res.getYZPostCoeff00Curve()));
    res.setYZPostCoeff01(FlameParamMapper.mapFloatParamToJwildfire(source.getYzP01(), res.getYZPostCoeff01Curve()));
    res.setYZPostCoeff10(FlameParamMapper.mapFloatParamToJwildfire(source.getYzP10(), res.getYZPostCoeff10Curve()));
    res.setYZPostCoeff11(FlameParamMapper.mapFloatParamToJwildfire(source.getYzP11(), res.getYZPostCoeff11Curve()));
    res.setYZPostCoeff20(FlameParamMapper.mapFloatParamToJwildfire(source.getYzP20(), res.getYZPostCoeff20Curve()));
    res.setYZPostCoeff21(FlameParamMapper.mapFloatParamToJwildfire(source.getYzP21(), res.getYZPostCoeff21Curve()));
    FlameParamMapper.mapFloatParamToJwildfire(source.getYzPRotate(), res.getYZPostRotateCurve());
    FlameParamMapper.mapFloatParamToJwildfire(source.getYzPScale(), res.getYZPostScaleCurve());

    res.setZXPostCoeff00(FlameParamMapper.mapFloatParamToJwildfire(source.getZxP00(), res.getZXPostCoeff00Curve()));
    res.setZXPostCoeff01(FlameParamMapper.mapFloatParamToJwildfire(source.getZxP01(), res.getZXPostCoeff01Curve()));
    res.setZXPostCoeff10(FlameParamMapper.mapFloatParamToJwildfire(source.getZxP10(), res.getZXPostCoeff10Curve()));
    res.setZXPostCoeff11(FlameParamMapper.mapFloatParamToJwildfire(source.getZxP11(), res.getZXPostCoeff11Curve()));
    res.setZXPostCoeff20(FlameParamMapper.mapFloatParamToJwildfire(source.getZxP20(), res.getZXPostCoeff20Curve()));
    res.setZXPostCoeff21(FlameParamMapper.mapFloatParamToJwildfire(source.getZxP21(), res.getZXPostCoeff21Curve()));
    FlameParamMapper.mapFloatParamToJwildfire(source.getZxPRotate(), res.getZXPostRotateCurve());
    FlameParamMapper.mapFloatParamToJwildfire(source.getZxPScale(), res.getZXPostScaleCurve());

    for(int i=0;i<source.getVariations().size();i++) {
      Variation srcVar = source.getVariations().get(i);
      org.jwildfire.create.tina.variation.Variation dstVar = new org.jwildfire.create.tina.variation.Variation();
      dstVar.setAmount(FlameParamMapper.mapFloatParamToJwildfire(srcVar.getAmount(), dstVar.getAmountCurve()));
      VariationFunc varFunc = VariationFuncList.getVariationFuncInstance(srcVar.getName(), true);
      dstVar.setFunc(varFunc);
      for (int j = 0; j < srcVar.getParams().size(); j++) {
        VariationParam param = srcVar.getParams().get(j);
        if(param.getValue().getParamType()==FlameParamType.CURVE && dstVar.getMotionCurve(param.getName())==null) {
          dstVar.createMotionCurve(param.getName());
        }
        if (param.getValue().getDataType() == FlameParamDataType.INT) {
          varFunc.setParameter(
              param.getName(),
              FlameParamMapper.mapIntParamToJwildfire(
                  param.getValue(), dstVar.getMotionCurve(param.getName())));
        }
        else { // FlameParamDataType.FLOAT
          varFunc.setParameter(
                  param.getName(),
                  FlameParamMapper.mapFloatParamToJwildfire(
                          param.getValue(), dstVar.getMotionCurve(param.getName())));
        }
      };
      // TODO manage also resource parameters
      res.getVariations().add(dstVar);
    }
    return res;
  }
}
