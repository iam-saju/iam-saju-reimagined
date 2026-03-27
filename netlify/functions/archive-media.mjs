import { getMediaStore } from './_archiveHelpers.mjs';

const getFallbackContentType = (key) => {
  const normalized = key.toLowerCase();
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.gif')) return 'image/gif';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.mp4')) return 'video/mp4';
  if (normalized.endsWith('.webm')) return 'video/webm';
  if (normalized.endsWith('.mov')) return 'video/quicktime';
  return 'application/octet-stream';
};

export default async function handler(request) {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get('key')?.trim();

  if (!key) {
    return Response.json({ error: 'Missing media key' }, { status: 400 });
  }

  try {
    const mediaStore = getMediaStore();
    const blobWithMetadata = await mediaStore.getWithMetadata(key, { type: 'arrayBuffer' });

    if (!blobWithMetadata || !blobWithMetadata.data) {
      return Response.json({ error: 'Media not found' }, { status: 404 });
    }

    const contentType = blobWithMetadata.metadata?.contentType || getFallbackContentType(key);
    const byteLength =
      blobWithMetadata.data instanceof ArrayBuffer
        ? blobWithMetadata.data.byteLength
        : undefined;

    return new Response(blobWithMetadata.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': 'inline',
        ...(typeof byteLength === 'number' ? { 'Content-Length': String(byteLength) } : {}),
      },
    });
  } catch (error) {
    console.error('archive media fetch failed', error);
    const message = error instanceof Error ? error.message : 'Failed to load media';
    return Response.json({ error: message }, { status: 500 });
  }
}

export const config = {
  path: '/api/archive-media',
};
