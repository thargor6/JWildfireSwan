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
import io.swagger.models.auth.In;
import lombok.extern.slf4j.Slf4j;
import org.jwildfire.base.Tools;
import org.jwildfire.swan.flames.model.Flame;
import org.jwildfire.swan.flames.model.RandomFlame;
import org.jwildfire.swan.flames.service.FlamesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Endpoint
@AnonymousAllowed
@Slf4j
public class GalleryEndpoint {
  private static List<String> exampleJsonMetadata = null;
  private static final String EXAMPLE_PATH = "examples";

  public @Nonnull List<@Nonnull String> getExampleList() {
    try {
      if(exampleJsonMetadata==null) {
        List<String> metaData = new ArrayList<>();
        ClassLoader cl = getClassLoader();
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(cl);
        Resource[] resources = resolver.getResources("classpath*:examples/example*.flame") ;
        for (Resource resource: resources){
          // in dev mode the entries sometimes seem to get duplicated, where a number is appended
          // to the duplicates (e. g. "example001" -> "example001 2").
          // We now skip these entries by filtering any entry having a space char in the name
          if(!resource.getFilename().contains(" ")) {
            try(InputStream in=getResourceAsStream(String.format("%s/%s", EXAMPLE_PATH, resource.getFilename()))) {
              if(in==null) {
                continue;
              }
            }
            try(InputStream in=getResourceAsStream(String.format("%s/%s.json", EXAMPLE_PATH, Tools.trimFileExt(resource.getFilename())))) {
              if(in!=null) {
                metaData.add(Tools.trimFileExt(resource.getFilename()));
              }
            }
          }
        }
        exampleJsonMetadata = metaData;
      }
      return exampleJsonMetadata;
    } catch (Throwable ex) {
      log.error("Error accessing example meta-data-list", ex);
      throw new RuntimeException(ex);
    }
  }

  public @Nonnull String getExampleMetaData(@Nonnull String example) {
    try {
      return getResourceContent(String.format("%s/%s.json", EXAMPLE_PATH, example));
    } catch (Throwable ex) {
      log.error("Error accessing example meta-data", ex);
      throw new RuntimeException(ex);
    }
  }

  public @Nonnull String getExampleFlameXml(@Nonnull String example) {
    try {
      return getResourceContent(String.format("%s/%s.flame", EXAMPLE_PATH, example));
    } catch (Throwable ex) {
      log.error("Error accessing example meta-data", ex);
      throw new RuntimeException(ex);
    }
  }

  private String getResourceContent(String filename) throws IOException {
    try(InputStream inputStream = getResourceAsStream(filename)) {
      StringBuilder textBuilder = new StringBuilder();
      try (Reader reader = new BufferedReader(new InputStreamReader
              (inputStream, Charset.forName(StandardCharsets.UTF_8.name())))) {
        int c = 0;
        while ((c = reader.read()) != -1) {
          textBuilder.append((char) c);
        }
        return textBuilder.toString();
      }
    }
  }

  private ClassLoader getClassLoader() {
    return this.getClass().getClassLoader();
  }

  private InputStream getResourceAsStream(String resource) {
    return getClassLoader().getResourceAsStream(resource);
  }

}
