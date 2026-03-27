import { getStore } from '@netlify/blobs';

const MANIFEST_STORE_NAME = 'archive-manifest';
const MANIFEST_KEY = 'items';
const MEDIA_STORE_NAME = 'archive-media';

const FALLBACK_ADMIN_KEY = 'leonardo_michelangelo_2025';

const getEnv = (name) => {
  if (typeof Netlify !== 'undefined' && Netlify?.env?.get) {
    const value = Netlify.env.get(name);
    if (value) return value;
  }

  return process.env[name];
};

const ARCHIVE_ADMIN_KEY = (getEnv('ARCHIVE_ADMIN_KEY') || FALLBACK_ADMIN_KEY).trim();

export const createTimestampLabel = (date = new Date()) =>
  date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toLowerCase();

export const createSortDate = (date = new Date()) => date.toISOString();

export const createDefaultTitle = (filename = '') => {
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  return withoutExt.replace(/[_-]+/g, ' ').trim() || 'untitled';
};

export const sanitizeFilename = (filename = '') =>
  filename.replace(/[^a-zA-Z0-9._-]/g, '_');

export const buildMediaUrl = (fileKey) =>
  `/api/archive-media?key=${encodeURIComponent(fileKey)}`;

export const extractMediaKey = (item) => {
  if (item && typeof item.fileKey === 'string' && item.fileKey.trim()) {
    return item.fileKey.trim();
  }

  const urlValue = item && typeof item.url === 'string' ? item.url : '';
  if (!urlValue) return '';

  try {
    const parsed = new URL(urlValue, 'https://example.com');
    return parsed.searchParams.get('key')?.trim() || '';
  } catch {
    return '';
  }
};

export const getManifestStore = () => getStore(MANIFEST_STORE_NAME);
export const getMediaStore = () => getStore(MEDIA_STORE_NAME);

export const readManifest = async () => {
  const store = getManifestStore();
  const manifest = await store.get(MANIFEST_KEY, { type: 'json' });
  return Array.isArray(manifest) ? manifest : [];
};

export const writeManifest = async (items) => {
  const store = getManifestStore();
  await store.setJSON(MANIFEST_KEY, Array.isArray(items) ? items : []);
};

export const isAdminAuthorized = (request) => {
  const headerValue = request.headers.get('authorization') || '';
  const expected = `Bearer ${ARCHIVE_ADMIN_KEY}`;
  return headerValue.trim() === expected;
};

export const unauthorizedResponse = () =>
  Response.json({ error: 'Unauthorized' }, { status: 401 });

