const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = Number(process.env.PORT || 3001);
const uploadsDir = path.join(__dirname, 'public', 'lovable-uploads');
const manifestPath = path.join(uploadsDir, 'archive-manifest.json');
const archiveAdminKey = (process.env.ARCHIVE_ADMIN_KEY || 'leonardo_michelangelo_2025').trim();
const allowedOrigins = new Set([
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  ...(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

// Create uploads directory if it doesn't exist.
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create manifest file if it doesn't exist.
if (!fs.existsSync(manifestPath)) {
  fs.writeFileSync(manifestPath, '[]', 'utf8');
}

// Enable CORS for local development and manual API checks.
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

const readManifest = () => {
  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeManifest = (items) => {
  fs.writeFileSync(manifestPath, JSON.stringify(items, null, 2), 'utf8');
};

const createTimestampLabel = (date = new Date()) =>
  date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toLowerCase();

const createSortDate = (date = new Date()) => date.toISOString();

const createDefaultTitle = (filename) =>
  path
    .parse(filename)
    .name
    .replace(/[_-]+/g, ' ')
    .trim() || 'untitled';

const resolveUploadFilePath = (itemUrl) => {
  if (typeof itemUrl !== 'string') return null;
  const prefix = '/lovable-uploads/';
  if (!itemUrl.startsWith(prefix)) return null;

  const filename = path.basename(itemUrl.slice(prefix.length));
  if (!filename) return null;

  return path.join(uploadsDir, filename);
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Use the filename from the request body if provided
    const customFilename = req.body.filename;
    if (customFilename) {
      cb(null, customFilename);
    } else {
      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const name = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, `${timestamp}_${name}${extension}`);
    }
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validate file types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mov',
      'video/webm'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  }
});

// Simple authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = (req.headers.authorization || '').trim();
  const expectedToken = `Bearer ${archiveAdminKey}`;
  
  if (authHeader === expectedToken) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Upload endpoint
app.post('/api/upload-archive', authenticateAdmin, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const caption = typeof req.body.caption === 'string' ? req.body.caption.trim() : '';
    const archiveItem = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      title: title || createDefaultTitle(req.file.originalname),
      caption,
      url: `/lovable-uploads/${req.file.filename}`,
      timestamp: createTimestampLabel(),
      sortDate: createSortDate(),
      uploadedAt: new Date().toISOString(),
      mediaType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
      lightBg: false,
      aspectRatio: 1,
    };

    const currentItems = readManifest();
    currentItems.unshift(archiveItem);
    writeManifest(currentItems);

    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: `lovable-uploads/${req.file.filename}`,
      item: archiveItem,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Delete an uploaded archive item by id.
app.delete('/api/archive-items/:id', authenticateAdmin, (req, res) => {
  try {
    const itemId = String(req.params.id || '').trim();

    if (!itemId) {
      return res.status(400).json({ error: 'Missing item id' });
    }

    const currentItems = readManifest();
    const itemIndex = currentItems.findIndex((item) => item && item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Archive item not found' });
    }

    const [removedItem] = currentItems.splice(itemIndex, 1);
    writeManifest(currentItems);

    const itemUrl = removedItem && typeof removedItem.url === 'string' ? removedItem.url : '';
    const filePath = resolveUploadFilePath(itemUrl);
    const stillReferenced = currentItems.some((item) => item && item.url === itemUrl);

    if (filePath && !stillReferenced && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, removedId: itemId });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Return uploaded archive items in reverse chronological order.
app.get('/api/archive-items', (req, res) => {
  const items = readManifest();
  res.json({ items });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
  }
  
  res.status(500).json({ error: error.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Archive upload server running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${uploadsDir}`);
});
