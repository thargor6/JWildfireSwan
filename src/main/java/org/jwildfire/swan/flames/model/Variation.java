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

package org.jwildfire.swan.flames.model;

import com.vaadin.fusion.Nonnull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Variation {
  @Nonnull private double amount;
  @Nonnull private String name;
  @Nonnull private final List<@Nonnull IParam> iParams = new ArrayList<>();
  @Nonnull private final List<@Nonnull DParam> dParams = new ArrayList<>();
}
