import {
  extractMediaKey,
  getMediaStore,
  isAdminAuthorized,
  readManifest,
  unauthorizedResponse,
  writeManifest,
} from './_archiveHelpers.mjs';

const resolveItemId = (request, context) => {
  const paramId = context?.params?.id;
  if (typeof paramId === 'string' && paramId.trim()) return paramId.trim();

  try {
    const path = new URL(request.url).pathname;
    const segments = path.split('/').filter(Boolean);
    return decodeURIComponent(segments[segments.length - 1] || '').trim();
  } catch {
    return '';
  }
};

export default async function handler(request, context) {
  if (request.method !== 'DELETE') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (!isAdminAuthorized(request)) {
    return unauthorizedResponse();
  }

  const itemId = resolveItemId(request, context);
  if (!itemId) {
    return Response.json({ error: 'Missing item id' }, { status: 400 });
  }

  try {
    const items = await readManifest();
    const index = items.findIndex((item) => item && item.id === itemId);

    if (index === -1) {
      return Response.json({ error: 'Archive item not found' }, { status: 404 });
    }

    const [removedItem] = items.splice(index, 1);
    await writeManifest(items);

    const fileKey = extractMediaKey(removedItem);
    const stillReferenced = fileKey
      ? items.some((item) => extractMediaKey(item) === fileKey)
      : false;

    if (fileKey && !stillReferenced) {
      const mediaStore = getMediaStore();
      await mediaStore.delete(fileKey);
    }

    return Response.json({ success: true, removedId: itemId });
  } catch (error) {
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
}

export const config = {
  path: '/api/archive-items/:id',
};

