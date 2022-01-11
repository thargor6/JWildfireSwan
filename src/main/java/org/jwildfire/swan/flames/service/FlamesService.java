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
        org.jwildfire.create.tina.base.Flame jwfFlame = new FlameReader(Prefs.getPrefs()).readFlamesfromXML(flameXml).stream().findFirst().get();
        return flameMapper.jwildfireToSwan(jwfFlame);
    }


}
