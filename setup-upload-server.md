# Archive Upload Server Setup

## Installation

1. Install the required dependencies for the upload server:

```bash
npm install express multer cors
```

## Running the Upload Server

1. Start the upload server (run this in a separate terminal):

```bash
node server.js
```

The server will run on `http://localhost:3001`

2. Start your Vite development server (in another terminal):

```bash
npm run dev
```

## Usage

1. Navigate to `http://localhost:8081/admin/archive-upload`
2. Enter the access key: `leonardo_michelangelo_2025`
3. Drag and drop files or click to browse
4. Upload files to your archive

## Security Features

- **Authentication**: Simple password-based access control
- **File Validation**: Only allows images and videos
- **Size Limits**: 50MB maximum file size
- **Secure Headers**: Bearer token authentication
- **File Naming**: Timestamp-based unique filenames

## File Types Supported

- **Images**: JPG, PNG, GIF, WebP
- **Videos**: MP4, MOV, WebM

## Production Deployment

For production deployment, consider:

1. Using environment variables for the access key
2. Implementing proper JWT authentication
3. Adding rate limiting
4. Using a cloud storage service (AWS S3, etc.)
5. Adding HTTPS
6. Implementing proper logging and monitoring

## API Endpoints

- `POST /api/upload-archive` - Upload files to archive
- `GET /api/health` - Health check endpoint

## File Structure

```
public/lovable-uploads/  # Upload destination
server.js               # Express server
src/pages/AdminArchive.tsx  # Admin interface
src/components/ArchiveUpload.tsx  # Upload component
src/components/AdminAuth.tsx      # Authentication
```
