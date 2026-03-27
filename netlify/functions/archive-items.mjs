import { readManifest } from './_archiveHelpers.mjs';

export default async function handler(request) {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const items = await readManifest();
    return Response.json({ items });
  } catch (error) {
    return Response.json({ error: 'Failed to load archive items' }, { status: 500 });
  }
}

export const config = {
  path: '/api/archive-items',
};

