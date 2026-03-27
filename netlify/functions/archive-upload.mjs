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
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const requestedFilename = String(formData.get('filename') || '').trim();
    const effectiveFilename = sanitizeFilename(requestedFilename || file.name || 'upload.bin');
    const now = Date.now();
    const fileKey = `uploads/${now}_${effectiveFilename}`;
    const mediaType = file.type?.startsWith('video/') ? 'video' : 'image';
    const mediaStore = getMediaStore();

    await mediaStore.set(fileKey, await file.arrayBuffer(), {
      metadata: {
        contentType: file.type || 'application/octet-stream',
        originalName: file.name || effectiveFilename,
      },
    });

    const titleInput = String(formData.get('title') || '').trim();
    const caption = String(formData.get('caption') || '').trim();

    const archiveItem = {
      id: `${now}_${Math.random().toString(36).slice(2, 10)}`,
      title: titleInput || createDefaultTitle(file.name || effectiveFilename),
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
      originalName: file.name || effectiveFilename,
      size: file.size,
      path: archiveItem.url,
      item: archiveItem,
    });
  } catch (error) {
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export const config = {
  path: '/api/upload-archive',
};

