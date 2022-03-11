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

package org.jwildfire.swan.flames.endpoint;

import org.jwildfire.swan.flames.repository.TempFileUploadRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Controller
public class TempFileUploadController {
  private final TempFileUploadRepository repository;

  public TempFileUploadController(TempFileUploadRepository repository) {
    this.repository = repository;
  }

  @PostMapping("/upload")
  @ResponseBody
  public ResponseEntity<UUID> handleFileUpload(
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok().body(repository.addFile(file));
  }

}
