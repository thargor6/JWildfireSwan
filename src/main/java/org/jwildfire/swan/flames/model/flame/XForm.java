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

import dev.hilla.Nonnull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class XForm {
  @Nonnull private double weight;
  @Nonnull private double color;
  @Nonnull private double colorSymmetry;

  @Nonnull private FlameParam xyC00;
  @Nonnull private FlameParam xyC01;
  @Nonnull private FlameParam xyC10;
  @Nonnull private FlameParam xyC11;
  @Nonnull private FlameParam xyC20;
  @Nonnull private FlameParam xyC21;

  @Nonnull private FlameParam yzC00;
  @Nonnull private FlameParam yzC01;
  @Nonnull private FlameParam yzC10;
  @Nonnull private FlameParam yzC11;
  @Nonnull private FlameParam yzC20;
  @Nonnull private FlameParam yzC21;

  @Nonnull private FlameParam zxC00;
  @Nonnull private FlameParam zxC01;
  @Nonnull private FlameParam zxC10;
  @Nonnull private FlameParam zxC11;
  @Nonnull private FlameParam zxC20;
  @Nonnull private FlameParam zxC21;

  @Nonnull private FlameParam xyP00;
  @Nonnull private FlameParam xyP01;
  @Nonnull private FlameParam xyP10;
  @Nonnull private FlameParam xyP11;
  @Nonnull private FlameParam xyP20;
  @Nonnull private FlameParam xyP21;

  @Nonnull private FlameParam yzP00;
  @Nonnull private FlameParam yzP01;
  @Nonnull private FlameParam yzP10;
  @Nonnull private FlameParam yzP11;
  @Nonnull private FlameParam yzP20;
  @Nonnull private FlameParam yzP21;

  @Nonnull private FlameParam zxP00;
  @Nonnull private FlameParam zxP01;
  @Nonnull private FlameParam zxP10;
  @Nonnull private FlameParam zxP11;
  @Nonnull private FlameParam zxP20;
  @Nonnull private FlameParam zxP21;

  @Nonnull private final List<@Nonnull Double> modifiedWeights = new ArrayList<>();
  @Nonnull private final List<@Nonnull Variation> variations = new ArrayList<>();
}
