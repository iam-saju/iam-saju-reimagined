import { useState, useCallback, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Image, Video, File } from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const ArchiveUpload = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file types
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/mov', 'video/webm']
  };

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): string | null => {
    const allAllowedTypes = [...allowedTypes.image, ...allowedTypes.video];
    
    if (!allAllowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload images (JPG, PNG, GIF, WebP) or videos (MP4, MOV, WebM).';
    }
    
    if (file.size > maxFileSize) {
      return 'File size too large. Maximum size is 50MB.';
    }
    
    return null;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (allowedTypes.image.includes(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('/placeholder-video.png'); // Fallback for videos
      }
    });
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const error = validateFile(file);
      
      if (error) {
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: '',
          progress: 0,
          status: 'error',
          error
        });
        continue;
      }

      const preview = await createPreview(file);
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview,
        progress: 0,
        status: 'pending'
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    const formData = new FormData();
    formData.append('file', uploadFile.file);

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    // const extension = uploadFile.file.name.split('.').pop();
    const filename = `${timestamp}_${uploadFile.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    formData.append('filename', filename);

    try {
      const response = await fetch('http://localhost:3001/api/upload-archive', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer leonardo_michelangelo_2025'
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      // Update file status to success
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'success', progress: 100 }
          : f
      ));
    } catch (error) {
      // Update file status to error
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    // Update all pending files to uploading
    setFiles(prev => prev.map(f => 
      f.status === 'pending' 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ));

    // Upload files sequentially to avoid overwhelming the server
    for (const file of pendingFiles) {
      await uploadFile(file);
    }

    setIsUploading(false);
  };

  const getFileIcon = (file: File) => {
    if (allowedTypes.image.includes(file.type)) {
      return <Image className="w-4 h-4" />;
    } else if (allowedTypes.video.includes(file.type)) {
      return <Video className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-lg font-light hover:text-primary transition-colors">
            ← back to home
          </a>
          <h1 className="text-lg font-light">archive upload</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-light">Archive Upload</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                where Leonardo codes, Michelangelo sculpts in zeros, and new snapshots join the archive of timeless records
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-sm p-12 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileInput}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports images (JPG, PNG, GIF, WebP) and videos (MP4, MOV, WebM)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 50MB
                  </p>
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
                >
                  Choose Files
                </button>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Files to Upload ({files.length})</h3>
                  <button
                    onClick={uploadAllFiles}
                    disabled={isUploading || files.every(f => f.status !== 'pending')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploading ? 'Uploading...' : 'Upload All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-sm p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-muted rounded-sm flex items-center justify-center flex-shrink-0">
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-sm"
                            />
                          ) : (
                            getFileIcon(file.file)
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{file.file.name}</p>
                            {getStatusIcon(file.status)}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2">
                            {(file.file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                          
                          {file.status === 'uploading' && (
                            <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          )}
                          
                          {file.error && (
                            <p className="text-xs text-red-500">{file.error}</p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArchiveUpload;
