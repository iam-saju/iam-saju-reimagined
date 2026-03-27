import {
  buildMediaUrl,
  createDefaultTitle,
  createSortDate,
  createTimestampLabel,
  getMediaStore,
  isAdminAuthorized,
  readManifest,
  sanitizeFilename,
  unauthorizedResponse,
  writeManifest,
} from './_archiveHelpers.mjs';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (!isAdminAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const uploaded = formData.get('file');
    const isBlobLike = Boolean(
      uploaded &&
      typeof uploaded === 'object' &&
      typeof uploaded.arrayBuffer === 'function'
    );

    if (!isBlobLike) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const file = uploaded;
    const fileName = typeof file.name === 'string' && file.name.trim() ? file.name.trim() : 'upload.bin';
    const fileType = typeof file.type === 'string' && file.type.trim() ? file.type.trim() : 'application/octet-stream';
    const fileSize = typeof file.size === 'number' ? file.size : 0;

    const requestedFilename = String(formData.get('filename') || '').trim();
    const effectiveFilename = sanitizeFilename(requestedFilename || fileName);
    const now = Date.now();
    const fileKey = `uploads/${now}_${effectiveFilename}`;
    const mediaType = fileType.startsWith('video/') ? 'video' : 'image';
    const mediaStore = getMediaStore();

    await mediaStore.set(fileKey, await file.arrayBuffer(), {
      metadata: {
        contentType: fileType,
        originalName: fileName || effectiveFilename,
      },
    });

    const titleInput = String(formData.get('title') || '').trim();
    const caption = String(formData.get('caption') || '').trim();

    const archiveItem = {
      id: `${now}_${Math.random().toString(36).slice(2, 10)}`,
      title: titleInput || createDefaultTitle(fileName || effectiveFilename),
      caption,
      url: buildMediaUrl(fileKey),
      fileKey,
      timestamp: createTimestampLabel(),
      sortDate: createSortDate(),
      uploadedAt: new Date().toISOString(),
      mediaType,
      lightBg: false,
      aspectRatio: 1,
    };

    const items = await readManifest();
    items.unshift(archiveItem);
    await writeManifest(items);

    return Response.json({
      success: true,
      filename: effectiveFilename,
      originalName: fileName || effectiveFilename,
      size: fileSize,
      path: archiveItem.url,
      item: archiveItem,
    });
  } catch (error) {
    console.error('archive upload failed', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return Response.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}

export const config = {
  path: '/api/upload-archive',
};
