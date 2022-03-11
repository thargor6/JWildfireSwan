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

import org.jwildfire.swan.flames.model.flame.Flame;
import org.springframework.stereotype.Service;

@Service
public class FlameMapper {
  private final LayerMapper layerMapper;

  public FlameMapper(LayerMapper layerMapper) {
    this.layerMapper = layerMapper;
  }

  public Flame mapFromJwildfire(org.jwildfire.create.tina.base.Flame source) {
    Flame res = new Flame();
    res.setBrightness(source.getBrightness());
    res.setWhiteLevel(source.getWhiteLevel());
    res.setContrast(source.getContrast());
    res.setSampleDensity(source.getSampleDensity());
    res.setLowDensityBrightness(source.getLowDensityBrightness());
    res.setBalanceRed(source.getBalanceRed());
    res.setBalanceGreen(source.getBalanceGreen());
    res.setBalanceBlue(source.getBalanceBlue());
    res.setGamma(source.getGamma());
    res.setGammaThreshold(source.getGammaThreshold());
    res.setForegroundOpacity(source.getForegroundOpacity());
    res.setVibrancy(source.getVibrancy());
    res.setSaturation(source.getSaturation());
    res.setPixelsPerUnit(source.getPixelsPerUnit());
    res.setWidth(source.getWidth());
    res.setHeight(source.getHeight());
    res.setCamZoom(source.getCamZoom());
    res.setCentreX(source.getCentreX());
    res.setCentreY(source.getCentreY());
    res.setCamYaw(source.getCamYaw());
    res.setCamPitch(source.getCamPitch());
    res.setCamRoll(source.getCamRoll());
    res.setCamBank(source.getCamBank());
    res.setCamDOF(source.getCamDOF());
    res.setCamDOFArea(source.getCamDOFArea());
    res.setCamPerspective(source.getCamPerspective());
    res.setDiminishZ(source.getDimishZ());
    res.setCamPosX(source.getCamPosX());
    res.setCamPosY(source.getCamPosY());
    res.setCamPosZ(source.getCamPosZ());
    res.setNewCamDOF(source.isNewCamDOF());
    res.setDimZDistance(source.getDimZDistance());
    res.setCamZ(source.getCamZ());
    res.setFocusX(source.getFocusX());
    res.setFocusY(source.getFocusY());
    res.setFocusZ(source.getFocusZ());
    res.setCamDOFExponent(source.getCamDOFExponent());
    res.getLayers().clear();
    source.getLayers().stream()
        .forEach(layer -> res.getLayers().add(layerMapper.mapFromJwildfire(source, layer)));
    return res;
  }

  public org.jwildfire.create.tina.base.Flame mapToJwildfire(Flame source) {
    org.jwildfire.create.tina.base.Flame res = new org.jwildfire.create.tina.base.Flame();
    res.setBrightness(source.getBrightness());
    res.setWhiteLevel(source.getWhiteLevel());
    res.setContrast(source.getContrast());
    res.setSampleDensity(source.getSampleDensity());
    res.setLowDensityBrightness(source.getLowDensityBrightness());
    res.setBalanceRed(source.getBalanceRed());
    res.setBalanceGreen(source.getBalanceGreen());
    res.setBalanceBlue(source.getBalanceBlue());
    res.setGamma(source.getGamma());
    res.setGammaThreshold(source.getGammaThreshold());
    res.setForegroundOpacity(source.getForegroundOpacity());
    res.setVibrancy(source.getVibrancy());
    res.setSaturation(source.getSaturation());
    res.setPixelsPerUnit(source.getPixelsPerUnit());
    res.setWidth(source.getWidth());
    res.setHeight(source.getHeight());
    res.setCamZoom(source.getCamZoom());
    res.setCentreX(source.getCentreX());
    res.setCentreY(source.getCentreY());
    res.setCamYaw(source.getCamYaw());
    res.setCamPitch(source.getCamPitch());
    res.setCamRoll(source.getCamRoll());
    res.setCamBank(source.getCamBank());
    res.setCamDOF(source.getCamDOF());
    res.setCamDOFArea(source.getCamDOFArea());
    res.setCamPerspective(source.getCamPerspective());
    res.setDimishZ(source.getDiminishZ());
    res.setCamPosX(source.getCamPosX());
    res.setCamPosY(source.getCamPosY());
    res.setCamPosZ(source.getCamPosZ());
    res.setNewCamDOF(source.isNewCamDOF());
    res.setDimZDistance(source.getDimZDistance());
    res.setCamZ(source.getCamZ());
    res.setFocusX(source.getFocusX());
    res.setFocusY(source.getFocusY());
    res.setFocusZ(source.getFocusZ());
    res.setCamDOFExponent(source.getCamDOFExponent());
    res.getLayers().clear();
    source.getLayers().stream()
            .forEach(layer -> res.getLayers().add(layerMapper.mapToJwildfire(layer)));
    return res;
  }
}
