/*
  JWildfire Swan - fractal flames the playful way, GPU accelerated
  Copyright (C) 2021-2022 Andreas Maschke

  This is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
  General License as published by the Free Software Foundation; either version 2.1 of the
  License, or (at your option) any later version.

  This software is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
  even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  Lesser General License for more details.

  You should have received a copy of the GNU Lesser General License along with this software;
  if not, write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
  02110-1301 USA, or see the FSF site: http://www.fsf.org.
*/

package org.jwildfire.swan.flames.model.flame;
import dev.hilla.Nonnull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Layer {
  @Nonnull
  private double weight;

  @Nonnull
  private double density;

  @Nonnull
  private final List<@Nonnull Color> gradient = new ArrayList<>();

  @Nonnull
  private final List<@Nonnull XForm> xforms = new ArrayList<>();

  @Nonnull
  private final List<@Nonnull XForm> finalXforms = new ArrayList<>();
}
