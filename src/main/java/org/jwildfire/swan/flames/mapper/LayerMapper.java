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

import org.jwildfire.create.tina.palette.RGBColor;
import org.jwildfire.swan.flames.model.flame.Color;
import org.jwildfire.swan.flames.model.flame.Layer;
import org.springframework.stereotype.Service;

@Service
public class LayerMapper {
  private final XFormMapper xFormMapper;

  public LayerMapper(XFormMapper xFormMapper) {
    this.xFormMapper = xFormMapper;
  }

  public Layer mapFromJwildfire(org.jwildfire.create.tina.base.Flame sourceFlame, org.jwildfire.create.tina.base.Layer source) {
    Layer res = new Layer();
    res.setWeight(source.getWeight());
    res.setDensity(source.getDensity());
    for(int i=0;i<source.getPalette().getSize();i++) {
      RGBColor color = source.getPalette().getColor(i);
      res.getGradient().add(new Color(color.getRed(), color.getGreen(), color.getBlue()));
    }
    source.getXForms().stream()
        .forEach(xForm -> res.getXforms().add(xFormMapper.mapFromJwildfire(sourceFlame, source, xForm)));
    source.getFinalXForms().stream()
        .forEach(xForm -> res.getFinalXforms().add(xFormMapper.mapFromJwildfire(sourceFlame, source, xForm)));
    return res;
  }

  public org.jwildfire.create.tina.base.Layer mapToJwildfire(Layer source) {
    org.jwildfire.create.tina.base.Layer res = new org.jwildfire.create.tina.base.Layer();
    res.setWeight(source.getWeight());
    res.setDensity(source.getDensity());

    for(int i=0;i<source.getGradient().size();i++) {
      Color color = source.getGradient().get(i);
      res.getPalette().setColor(i, color.getR(), color.getG(), color.getB());
    }

    source.getXforms().stream()
            .forEach(xForm -> res.getXForms().add(xFormMapper.mapToJwildfire(source, xForm)));
    source.getFinalXforms().stream()
            .forEach(xForm -> res.getFinalXForms().add(xFormMapper.mapToJwildfire(source, xForm)));
    return res;
  }
}
