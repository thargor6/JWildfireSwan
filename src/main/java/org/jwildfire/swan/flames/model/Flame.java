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

package org.jwildfire.swan.flames.model;
import dev.hilla.Nonnull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class Flame {
  @Nonnull
  private UUID uid;

  @Nonnull
  private double brightness;

  @Nonnull
  private double contrast;

  @Nonnull
  private double sampleDensity;

  @Nonnull
  private double lowDensityBrightness;

  @Nonnull
  private double foregroundOpacity;

  @Nonnull
  private double vibrancy;

  @Nonnull
  private double saturation;

  @Nonnull
  private double gamma;

  @Nonnull
  private double gammaThreshold;

  @Nonnull
  private double balanceRed;

  @Nonnull
  private double balanceGreen;

  @Nonnull
  private double balanceBlue;

  @Nonnull
  private double whiteLevel;

  @Nonnull
  private double pixelsPerUnit;

  @Nonnull
  private int width;

  @Nonnull
  private int height;

  @Nonnull
  private double camZoom;

  @Nonnull
  private double centreX;

  @Nonnull
  private double centreY;

  @Nonnull
  private double camYaw;

  @Nonnull
  private double camPitch;

  @Nonnull
  private double camRoll;

  @Nonnull
  private double camBank;

  @Nonnull
  private double camDOF;

  @Nonnull
  private double camDOFArea;

  @Nonnull
  private double camPerspective;

  @Nonnull
  private double diminishZ;

  @Nonnull
  private double camPosX;

  @Nonnull
  private double camPosY;

  @Nonnull
  private double camPosZ;

  @Nonnull
  private boolean newCamDOF = false;

  @Nonnull
  private double dimZDistance;

  @Nonnull
  private double camZ;

  @Nonnull
  private double focusX;

  @Nonnull
  private double focusY;

  @Nonnull
  private double focusZ;

  @Nonnull
  private double camDOFExponent;

  @Nonnull
  private final List<@Nonnull Color> gradient = new ArrayList<>();

  @Nonnull
  private final List<@Nonnull XForm> xforms = new ArrayList<>();

  @Nonnull
  private final List<@Nonnull XForm> finalXforms = new ArrayList<>();
}
