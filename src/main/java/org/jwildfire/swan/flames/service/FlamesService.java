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

import org.jwildfire.base.Prefs;
import org.jwildfire.create.tina.io.FlameReader;
import org.jwildfire.swan.flames.mapper.FlameMapper;
import org.jwildfire.swan.flames.model.Flame;
import org.jwildfire.swan.flames.repository.FlamesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FlamesService {
  private final FlamesRepository repository;
  private final FlameMapper flameMapper;

  public FlamesService(@Autowired FlamesRepository repository, FlameMapper flameMapper) {
    this.repository = repository;
    this.flameMapper = flameMapper;
  }

  public int count() {
    return repository.count();
  }

  public Flame parseFlame(String flameXml) {
    org.jwildfire.create.tina.base.Flame jwfFlame =
        new FlameReader(Prefs.getPrefs()).readFlamesfromXML(flameXml).stream().findFirst().get();
    return flameMapper.mapFromJwildfire(jwfFlame);
  }
}
