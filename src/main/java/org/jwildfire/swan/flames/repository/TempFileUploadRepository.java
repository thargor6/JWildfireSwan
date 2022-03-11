/*
  JWildfire Swan - fractal flames the playful way, GPU accelerated
  Copyright (C) 2021-2022 Andreas Maschke

  This is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
  General License as published by the Free Software Foundation; either version 2.1 of the
  License, or (at your option) any later version.

  This software is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
  even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  Lesser General License for more details.

  You should have received a copy of the GNU Lesser General License along with this software;
  if not, write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
  02110-1301 USA, or see the FSF site: http://www.fsf.org.
*/

package org.jwildfire.swan.flames.repository;

import org.jwildfire.swan.flames.model.upload.TempFileUpload;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class TempFileUploadRepository {
  private static final Map<UUID, TempFileUpload> uploads = new HashMap<>();
  private static final Map<UUID, byte[]> content = new HashMap<>();

  public UUID addFile(MultipartFile file) {
    try {
      TempFileUpload upload = new TempFileUpload();
      upload.setName(file.getOriginalFilename());
      upload.setContenttype(file.getContentType());
      byte[] fileContent;
      if(!file.isEmpty()) {
        fileContent = file.getInputStream().readAllBytes();
        upload.setSize(fileContent.length);
      }
      else {
        fileContent=null;
        upload.setSize(0);
      }
      upload.setUuid(UUID.randomUUID());
      this.uploads.put(upload.getUuid(), upload);
      this.content.put(upload.getUuid(), fileContent);
      return upload.getUuid();
    }
    catch (IOException e) {
      throw new RuntimeException("Failed to store file.", e);
    }
  }

  public List<TempFileUpload> getAllFiles() {
    return new ArrayList<>(uploads.values());
  }
}
