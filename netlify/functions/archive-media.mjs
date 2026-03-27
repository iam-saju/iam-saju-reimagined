import { getMediaStore } from './_archiveHelpers.mjs';

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
    const blobWithMetadata = await mediaStore.getWithMetadata(key);

    if (!blobWithMetadata || !blobWithMetadata.data) {
      return Response.json({ error: 'Media not found' }, { status: 404 });
    }

    const contentType = blobWithMetadata.metadata?.contentType || 'application/octet-stream';
    return new Response(blobWithMetadata.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
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
