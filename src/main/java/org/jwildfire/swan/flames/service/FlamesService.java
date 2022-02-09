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
import org.jwildfire.base.Tools;
import org.jwildfire.cli.CliOptions;
import org.jwildfire.cli.CliUtils;
import org.jwildfire.cli.OptionsParserUtil;
import org.jwildfire.create.tina.io.FlameReader;
import org.jwildfire.create.tina.io.FlameWriter;
import org.jwildfire.create.tina.palette.RGBPalette;
import org.jwildfire.create.tina.randomflame.*;
import org.jwildfire.create.tina.randomgradient.AllRandomGradientGenerator;
import org.jwildfire.create.tina.randomgradient.RandomGradientGenerator;
import org.jwildfire.create.tina.randomgradient.RandomGradientGeneratorList;
import org.jwildfire.create.tina.randomsymmetry.RandomSymmetryGeneratorList;
import org.jwildfire.create.tina.randomweightingfield.RandomWeightingFieldGeneratorList;
import org.jwildfire.create.tina.variation.VariationFuncList;
import org.jwildfire.swan.flames.mapper.FlameMapper;
import org.jwildfire.swan.flames.model.Flame;
import org.jwildfire.swan.flames.model.RandomFlame;
import org.jwildfire.swan.flames.repository.FlamesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
        new FlameReader(Prefs.getPrefs()).readFlamesfromXML(flameXml).stream().findFirst().orElseThrow();
    return flameMapper.mapFromJwildfire(jwfFlame);
  }

  private static List<RandomFlameGenerator> allGenerators;

  static {
    allGenerators = new ArrayList<>();

    allGenerators.add(new BubblesRandomFlameGenerator());
    allGenerators.add(new Bubbles3DRandomFlameGenerator());
    allGenerators.add(new ExperimentalBubbles3DRandomFlameGenerator());
    allGenerators.add(new ExperimentalSimpleRandomFlameGenerator());
    allGenerators.add(new JulianDiscRandomFlameGenerator());
    allGenerators.add(new JuliansRandomFlameGenerator());
    allGenerators.add(new LinearRandomFlameGenerator());
    allGenerators.add(new RaysRandomFlameGenerator());
    allGenerators.add(new SimpleRandomFlameGenerator());

    allGenerators.add(new SierpinskyRandomFlameGenerator());
    allGenerators.add(new SphericalRandomFlameGenerator());
    allGenerators.add(new Spherical3DRandomFlameGenerator());
    allGenerators.add(new SplitsRandomFlameGenerator());
    allGenerators.add(new TentacleRandomFlameGenerator());
    allGenerators.add(new XenomorphRandomFlameGenerator());

    allGenerators.add(new BrokatRandomFlameGenerator());
    allGenerators.add(new Brokat3DRandomFlameGenerator());
    allGenerators.add(new CrossRandomFlameGenerator());
    allGenerators.add(new DualityRandomFlameGenerator());
  //  allGenerators.add(new DuckiesRandomFlameGenerator());

  //  allGenerators.add(new ExperimentalGnarlRandomFlameGenerator());

  //  allGenerators.add(new FilledFlowers3DRandomFlameGenerator());
 //   allGenerators.add(new Flowers3DRandomFlameGenerator());
    allGenerators.add(new GalaxiesRandomFlameGenerator());
    allGenerators.add(new GhostsRandomFlameGenerator());
    allGenerators.add(new OrchidsRandomFlameGenerator());
    allGenerators.add(new EDiscRandomFlameGenerator());
    allGenerators.add(new PhoenixRandomFlameGenerator());
    allGenerators.add(new SpiralsRandomFlameGenerator());
    allGenerators.add(new Spirals3DRandomFlameGenerator());
    allGenerators.add(new GnarlRandomFlameGenerator());
    allGenerators.add(new Gnarl3DRandomFlameGenerator());

  //  allGenerators.add(new JulianRingsRandomFlameGenerator());

//    allGenerators.add(new Affine3DRandomFlameGenerator());
 //   allGenerators.add(new MachineRandomFlameGenerator());
//   allGenerators.add(new OutlinesRandomFlameGenerator());
 //   allGenerators.add(new RasterRandomFlameGenerator());
//    allGenerators.add(new SimpleTilingRandomFlameGenerator());

 //   allGenerators.add(new SynthRandomFlameGenerator());

 //   allGenerators.add(new TileBallRandomFlameGenerator());

  }

  public RandomFlame generateRandomFlame(List<String> supportedVariations) {
    int idx = (int)(Math.random()*allGenerators.size());
    String randGenFlameName = allGenerators.get(idx).getName(); //RandomFlameGeneratorList.DEFAULT_GENERATOR_NAME;
    String randGenGradientName = new AllRandomGradientGenerator().getName();
    String randGenSymmetryName = RandomSymmetryGeneratorList.NONE.getName();
    String randGenWFieldName = RandomWeightingFieldGeneratorList.NONE.getName();

    VariationFuncList.setSupportedVariations(supportedVariations);
    org.jwildfire.create.tina.base.Flame flame = CliUtils.createRandomFlame(randGenFlameName, randGenGradientName, randGenSymmetryName, randGenWFieldName);
    String flameXml = null;
    try {
      flameXml = new FlameWriter().getFlameXML(flame);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    return new RandomFlame(flameMapper.mapFromJwildfire(flame), flameXml);
  }

  public RandomFlame generateRandomGradientForFlame(Flame refFlame) {
    String randGenGradientName = new AllRandomGradientGenerator().getName();

    RandomGradientGenerator rndGradGen = RandomGradientGeneratorList.getRandomGradientGeneratorInstance(randGenGradientName, true);
    int palettePoints = 3 + Tools.randomInt(21);
    boolean fadePaletteColors = Math.random() > 0.09D;
    boolean uniformSize = Math.random() > 0.75D;

    RGBPalette palette = rndGradGen.generatePalette(palettePoints, fadePaletteColors, uniformSize);

    org.jwildfire.create.tina.base.Flame jwfFlame = flameMapper.mapToJwildfire(refFlame);
    jwfFlame.getFirstLayer().setPalette(palette);

    String flameXml = null;
    try {
      flameXml = new FlameWriter().getFlameXML(jwfFlame);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
     return new RandomFlame(flameMapper.mapFromJwildfire(jwfFlame), flameXml);
  }
}
