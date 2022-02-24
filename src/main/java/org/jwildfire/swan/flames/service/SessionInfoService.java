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

package org.jwildfire.swan.flames.service;

import org.springframework.boot.SpringApplicationRunListener;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.Duration;

@Service
public class SessionInfoService {
  private long randomFlamesCreated = 0;

  private long randomGradientsCreated = 0;

  private long exampleFlamesProvided = 0;

  private long flamesParsed = 0;

  private long flamesRendered = 0;

  private long appStartTime;

  @PostConstruct
  void initAppStartTime() {
    appStartTime = System.currentTimeMillis();
  }

  public long getUpTimeInMs() {
    return System.currentTimeMillis() - appStartTime;
  }

  public long getRandomFlamesCreated() {
    return randomFlamesCreated;
  }

  public void incRandomFlamesCreated() {
    synchronized (this) {
      randomFlamesCreated++;
    }
  }

  public long getRandomGradientsCreated() {
    return randomGradientsCreated;
  }

  public void incRandomGradientsCreated() {
    synchronized (this) {
      randomGradientsCreated++;
    }
  }

  public long getFlamesRendered() {
    return flamesRendered;
  }

  public void incFlamesRendered() {
    synchronized (this) {
      flamesRendered++;
    }
  }

  public long getExampleFlamesProvided() {
    return exampleFlamesProvided;
  }

  public void incExampleFlamesProvided() {
    synchronized (this) {
      exampleFlamesProvided++;
    }
  }

  public long getFlamesParsed() {
    return flamesParsed;
  }

  public void incFlamesParsed() {
    synchronized (this) {
      flamesParsed++;
    }
  }
}
