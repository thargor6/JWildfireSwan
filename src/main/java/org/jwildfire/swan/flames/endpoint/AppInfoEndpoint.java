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

import com.vaadin.flow.server.auth.AnonymousAllowed;
import dev.hilla.Endpoint;
import dev.hilla.Nonnull;
import lombok.extern.slf4j.Slf4j;

import org.jwildfire.swan.flames.service.SessionInfoService;
import org.springframework.beans.factory.annotation.Value;

@Endpoint
@AnonymousAllowed
@Slf4j
public class AppInfoEndpoint {
  private final SessionInfoService sessionInfoService;

  @Value("${swan.appVersion}")
  private String appVersion;

  @Value("${swan.appBuildDate}")
  private String appBuildDate;

  public AppInfoEndpoint(SessionInfoService sessionInfoService) {
    this.sessionInfoService = sessionInfoService;
  }

  public @Nonnull String getAppVersion() {
    return appVersion;
  }

  public @Nonnull String getAppBuildDate() {
    return appBuildDate;
  }

  public @Nonnull long getUpTimeInMs() {
    return sessionInfoService.getUpTimeInMs();
  }

  public @Nonnull long getRandomFlamesCreated() {
    return sessionInfoService.getRandomFlamesCreated();
  }

  public @Nonnull long getFlamesRendered() {
    return sessionInfoService.getFlamesRendered();
  }

  public void incFlamesRendered() {
    sessionInfoService.incFlamesRendered();
  }

  public @Nonnull long getRandomGradientsCreated() {
    return sessionInfoService.getRandomGradientsCreated();
  }

  public @Nonnull long getExampleFlamesProvided() {
    return sessionInfoService.getExampleFlamesProvided();
  }

  public @Nonnull long getFlamesParsed() {
    return sessionInfoService.getFlamesParsed();
  }

}
