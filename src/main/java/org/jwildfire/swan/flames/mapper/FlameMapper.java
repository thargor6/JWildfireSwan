package org.jwildfire.swan.flames.mapper;

import org.jwildfire.swan.flames.model.Flame;
import org.mapstruct.Mapper;

@Mapper
public interface FlameMapper {
  org.jwildfire.create.tina.base.Flame swanToJwildfire(Flame source);
  Flame jwildfireToSwan(org.jwildfire.create.tina.base.Flame destination);
}
