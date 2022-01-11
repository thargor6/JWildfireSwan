package org.jwildfire.swan.flames.model;
import com.vaadin.fusion.Nonnull;
import lombok.Data;

@Data
public class XForm {
  @Nonnull private double weight;
  @Nonnull private double color;
  @Nonnull private double symmetry;
  @Nonnull private double c00;
  @Nonnull private double c01;
  @Nonnull private double c10;
  @Nonnull private double c11;
  @Nonnull private double c20;
  @Nonnull private double c21;
}
