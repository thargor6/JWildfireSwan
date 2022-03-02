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
package org.jwildfire.swan.flames.endpoint;

import com.google.common.io.Resources;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.fusion.Endpoint;
import com.vaadin.fusion.Nonnull;
import lombok.extern.slf4j.Slf4j;
import org.jwildfire.swan.flames.model.Flame;
import org.jwildfire.swan.flames.model.RandomFlame;
import org.jwildfire.swan.flames.service.FlamesService;
import org.jwildfire.swan.flames.service.SessionInfoService;
import org.springframework.beans.factory.annotation.Autowired;

import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Endpoint
@AnonymousAllowed
@Slf4j
public class FlamesEndpoint {

  private final FlamesService service;
  private final SessionInfoService sessionInfoService;

  public FlamesEndpoint(@Autowired FlamesService service, SessionInfoService sessionInfoService) {
    this.service = service;
    this.sessionInfoService = sessionInfoService;
  }

  public int count() {
    return service.count();
  }

  public @Nonnull Flame getExampleFlame(String name) {
    URL url = Resources.getResource(String.format("examples/%s.flame", name));
    try {
      String flameXml = Resources.toString(url, StandardCharsets.UTF_8);
      Flame flame = service.parseFlame(flameXml);
      sessionInfoService.incExampleFlamesProvided();
      return flame;
    } catch (Throwable ex) {
      log.error(String.format("Error reading file %s", url), ex);
      throw new RuntimeException(ex);
    }
  }

  public @Nonnull Flame parseFlame(String flameXml) {
    try {
      Flame flame = service.parseFlame(flameXml);
      sessionInfoService.incFlamesParsed();
      return flame;
    } catch (Throwable ex) {
      log.error("Error parsing flame", ex);
      throw new RuntimeException(ex);
    }
  }

  public @Nonnull RandomFlame generateRandomFlame(@Nonnull List<@Nonnull String> supportedVariations) {
    try {
      RandomFlame res = service.generateRandomFlame(supportedVariations);
      sessionInfoService.incRandomFlamesCreated();
      return res;
    } catch (Throwable ex) {
      log.error("Error generating random flame", ex);
      throw new RuntimeException(ex);
    }
  }

  public @Nonnull RandomFlame generateRandomGradientForFlame(@Nonnull Flame refFlame) {
    try {
      RandomFlame res = service.generateRandomGradientForFlame(refFlame);
      sessionInfoService.getRandomGradientsCreated();
      return res;
    } catch (Throwable ex) {
      log.error("Error generating random gradient", ex);
      throw new RuntimeException(ex);
    }
  }

  public @Nonnull String convertFlameToXml(@Nonnull Flame flame) {
    try {
      return service.convertFlameToXml(flame);
    } catch (Throwable ex) {
      log.error("Error generating random gradient", ex);
      throw new RuntimeException(ex);
    }
  }
}
