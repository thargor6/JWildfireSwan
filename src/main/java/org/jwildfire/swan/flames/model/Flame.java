package org.jwildfire.swan.flames.model;
import com.vaadin.fusion.Nonnull;
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
  private final List<@Nonnull XForm> xforms = new ArrayList<>();

}
