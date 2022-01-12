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

import org.jwildfire.swan.flames.model.XForm;
import org.springframework.stereotype.Service;

@Service
public class XFormMapper {

  public XForm mapFromJwildfire(org.jwildfire.create.tina.base.XForm source) {
    XForm res = new XForm();

    res.setWeight(source.getWeight());
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
    return res;
  }
}
