const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for development
app.use(cors({
  origin: 'http://localhost:8081', // Your Vite dev server
  credentials: true
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'lovable-uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
  const authHeader = req.headers.authorization;
  const expectedToken = 'Bearer leonardo_michelangelo_2025';
  
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

    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: `lovable-uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
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
