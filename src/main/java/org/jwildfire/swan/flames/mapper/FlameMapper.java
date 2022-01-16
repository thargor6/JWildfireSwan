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

import org.jwildfire.swan.flames.model.Flame;
import org.springframework.stereotype.Service;

@Service
public class FlameMapper {
  private final XFormMapper xFormMapper;

  public FlameMapper(XFormMapper xFormMapper) {
    this.xFormMapper = xFormMapper;
  }

  public Flame mapFromJwildfire(org.jwildfire.create.tina.base.Flame source) {
    Flame res = new Flame();
    res.setBrightness(source.getBrightness());
    source.getFirstLayer().getXForms().stream()
        .forEach(xForm -> res.getXforms().add(xFormMapper.mapFromJwildfire(source, xForm)));
    source.getFirstLayer().getFinalXForms().stream()
        .forEach(xForm -> res.getFinalXforms().add(xFormMapper.mapFromJwildfire(source, xForm)));
    return res;
  }
}
