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
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class TempFileUploadRepository {
  private static final Map<String, List<UUID>> uploads = new HashMap<>();
  private static final Map<String,Map<UUID, TempFileUpload>> uploadMetadata = new HashMap<>();
  private static final Map<String,Map<UUID, byte[]>> uploadContent = new HashMap<>();
  private static final int MAX_CONTENT_SIZE_PER_SESSION = 10 * 1000 * 1000; // 10 MB
  private static final int MAX_FILE_SIZE = 2 * 1000 * 1000; // 2MB
  private static final int MAX_DURATION_IN_SECONDS = 30 * 60;

  private String getSessionId() {
    return RequestContextHolder.currentRequestAttributes().getSessionId();
  }

  public synchronized UUID addFile(MultipartFile file) {
    try {
      final String filename = file.getOriginalFilename();
      final byte[] fileContent = file.isEmpty() ? null : file.getInputStream().readAllBytes();
      final int fileLength = file.isEmpty() | fileContent == null ? 0 : fileContent.length;
      if(fileLength>MAX_FILE_SIZE) {
        throw new RuntimeException("Size of uploaded file is too large");
      }
      // actually store only files which are not in memory yet
      return findUploadByNameAndContent(filename, fileContent).map(TempFileUpload::getUuid).orElseGet(() -> {
          TempFileUpload upload = new TempFileUpload();
          upload.setName(filename);
          upload.setSize(fileLength);
          upload.setContenttype(file.getContentType());
          upload.setUuid(UUID.randomUUID());
          upload.setSessionId(getSessionId());
          upload.setTimestamp(System.currentTimeMillis());
          addUpload(upload, fileContent);
          return upload.getUuid();
        }
      );
    }
    catch (IOException e) {
      throw new RuntimeException("Failed to store temporary file.", e);
    }
  }

  private Optional<TempFileUpload> findUploadByNameAndContent(String name, byte[] content) {
    final String sessionId = getSessionId();
    Map<UUID, byte[]> contentOfSession = uploadContent.getOrDefault(sessionId, new HashMap<>());
    Map<UUID, TempFileUpload> metaDataOfSession = uploadMetadata.getOrDefault(sessionId, new HashMap<>());

    return metaDataOfSession.values().stream()
        .filter(upload -> upload.getName().equals(name) && upload.getSessionId().equals(sessionId))
        .filter(upload -> {
          byte[] uploadedContent = contentOfSession.get(upload.getUuid());
          return ((uploadedContent == null && content == null)
                  || (uploadedContent != null
                  && content != null
                  && Arrays.equals(uploadedContent, content)));
                }
             ).findFirst();
  }

  private void addUpload(TempFileUpload upload, byte[] fileContent) {
    final String sessionId = getSessionId();
    Map<UUID, byte[]> contentOfSession = uploadContent.computeIfAbsent(sessionId, k -> new HashMap<>());
    Map<UUID, TempFileUpload> metaDataOfSession = uploadMetadata.computeIfAbsent(sessionId, k -> new HashMap<>());
    List<UUID> uploadsOfSession = uploads.computeIfAbsent(sessionId, k -> new ArrayList<>());

    // remove outdated entries regardless of session
    long now = System.currentTimeMillis();
    uploadMetadata.values().stream().map(Map::values).flatMap(Collection::stream)
            .collect(Collectors.toList()).stream()
            .filter(md -> md.getTimestamp() + MAX_DURATION_IN_SECONDS * 1000 < now).forEach(md -> {
              final Map<UUID, byte[]> contentOfOtherSession = uploadContent.getOrDefault(md.getSessionId(), new HashMap<>());
              contentOfOtherSession.remove(md.getUuid());
              final Map<UUID, TempFileUpload> metaDataOfOtherSession = uploadMetadata.getOrDefault(md.getSessionId(), new HashMap<>());
              metaDataOfOtherSession.remove(md.getUuid());
              final List<UUID> uploadsOfOtherSession = uploads.getOrDefault(md.getSessionId(), new ArrayList<>());
              uploadsOfOtherSession.remove(md.getUuid());
            });
    // remove entries of the same session to reduce session session size
    int size = fileContent.length;
    int currTotalSize = contentOfSession.values().stream().map(content -> content.length).reduce(0, Integer::sum);

    while(size + currTotalSize > MAX_CONTENT_SIZE_PER_SESSION) {
      UUID first = uploadsOfSession.get(0);
      currTotalSize -= contentOfSession.get(first).length;
      contentOfSession.remove(first);
      metaDataOfSession.remove(first);
      uploadsOfSession.remove(first);
    }
    // now add the recent file
    uploadsOfSession.add(upload.getUuid());
    metaDataOfSession.put(upload.getUuid(), upload);
    contentOfSession.put(upload.getUuid(), fileContent);
  }

  public byte[] getContent(UUID uuid) {
    Map<UUID, byte[]> contentMap = uploadContent.get(getSessionId());
    if(contentMap==null) {
      throw new RuntimeException("No content found");
    }
    byte[] content = contentMap.get(uuid);
    if(content==null) {
      throw new RuntimeException("Content not found");
    }
    return content;
  }

  public void removeTempFile(UUID uuid) {
    final String sessionId = getSessionId();
    List<UUID> uploadsOfSession = uploads.getOrDefault(sessionId, new ArrayList<>());
    Map<UUID, byte[]> contentOfSession = uploadContent.getOrDefault(sessionId, new HashMap<>());
    Map<UUID, TempFileUpload> metaDataOfSession = uploadMetadata.getOrDefault(sessionId, new HashMap<>());
    uploadsOfSession.remove(uuid);
    contentOfSession.remove(uuid);
    metaDataOfSession.remove(uuid);
  }
}
