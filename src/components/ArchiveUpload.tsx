import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, Image, Video, File, Trash2 } from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  title: string;
  caption: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface ExistingArchiveItem {
  id: string;
  title: string;
  caption?: string;
  url: string;
  timestamp?: string;
  mediaType?: 'image' | 'video';
}

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/mov', 'video/webm']
} as const;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ArchiveUpload = () => {
  const uploadApiBase = import.meta.env.VITE_UPLOAD_API_URL || 'http://localhost:3001';
  const defaultAuthToken = `Bearer ${((import.meta.env.VITE_ARCHIVE_ADMIN_KEY as string | undefined)?.trim() || 'leonardo_michelangelo_2025')}`;
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isApiReachable, setIsApiReachable] = useState<boolean | null>(null);
  const [existingItems, setExistingItems] = useState<ExistingArchiveItem[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [existingError, setExistingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaUrl = (url: string) => {
    if (/^https?:\/\//i.test(url)) return url;
    return `${uploadApiBase}${url}`;
  };

  const createDefaultTitle = (filename: string) => {
    const withoutExt = filename.replace(/\.[^/.]+$/, '');
    return withoutExt.replace(/[_-]+/g, ' ').trim();
  };

  const validateFile = useCallback((file: File): string | null => {
    const allAllowedTypes: string[] = [...ALLOWED_TYPES.image, ...ALLOWED_TYPES.video];
    
    if (!allAllowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload images (JPG, PNG, GIF, WebP) or videos (MP4, MOV, WebM).';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size too large. Maximum size is 50MB.';
    }
    
    return null;
  }, []);

  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (ALLOWED_TYPES.image.includes(file.type as typeof ALLOWED_TYPES.image[number])) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('/placeholder-video.png'); // Fallback for videos
      }
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3000);

    const checkHealth = async () => {
      try {
        const response = await fetch(`${uploadApiBase}/api/health`, { signal: controller.signal });
        if (!isCancelled) {
          setIsApiReachable(response.ok);
        }
      } catch {
        if (!isCancelled) {
          setIsApiReachable(false);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    void checkHealth();

    return () => {
      isCancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [uploadApiBase]);

  const loadExistingItems = useCallback(async () => {
    setIsLoadingExisting(true);
    setExistingError(null);

    try {
      const response = await fetch(`${uploadApiBase}/api/archive-items`);
      if (!response.ok) throw new Error('Failed to load archive items');

      const data = await response.json() as { items?: unknown[] };
      if (!Array.isArray(data.items)) {
        setExistingItems([]);
        return;
      }

      const parsed = data.items.flatMap((entry) => {
        if (!entry || typeof entry !== 'object') return [];
        const item = entry as Record<string, unknown>;
        const id = typeof item.id === 'string' ? item.id : '';
        const url = typeof item.url === 'string' ? item.url : '';
        if (!id || !url) return [];

        return [{
          id,
          title: typeof item.title === 'string' && item.title.trim() ? item.title : 'untitled',
          caption: typeof item.caption === 'string' ? item.caption : '',
          url,
          timestamp: typeof item.timestamp === 'string' ? item.timestamp : '',
          mediaType: item.mediaType === 'video' ? 'video' : 'image',
        } satisfies ExistingArchiveItem];
      });

      setExistingItems(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load archive items';
      setExistingError(message);
      setExistingItems([]);
    } finally {
      setIsLoadingExisting(false);
    }
  }, [uploadApiBase]);

  useEffect(() => {
    if (isApiReachable === false) return;
    void loadExistingItems();
  }, [isApiReachable, loadExistingItems]);

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
          title: createDefaultTitle(file.name),
          caption: '',
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
        title: createDefaultTitle(file.name),
        caption: '',
        progress: 0,
        status: 'pending'
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [createPreview, validateFile]);

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

  const removeExistingItem = useCallback(async (id: string) => {
    setDeletingId(id);
    setExistingError(null);

    try {
      const authToken = sessionStorage.getItem('admin_auth_token') || defaultAuthToken;
      const response = await fetch(`${uploadApiBase}/api/archive-items/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: authToken,
        },
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error || 'Failed to remove image');
      }

      setExistingItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove image';
      setExistingError(message);
    } finally {
      setDeletingId(null);
    }
  }, [uploadApiBase, defaultAuthToken]);

  const updateCaption = (id: string, caption: string) => {
    setFiles(prev =>
      prev.map(file =>
        file.id === id
          ? { ...file, caption }
          : file
      )
    );
  };

  const updateTitle = (id: string, title: string) => {
    setFiles(prev =>
      prev.map(file =>
        file.id === id
          ? { ...file, title }
          : file
      )
    );
  };

  const uploadFile = useCallback(async (uploadFile: UploadFile): Promise<void> => {
    const formData = new FormData();
    formData.append('file', uploadFile.file);
    formData.append('title', uploadFile.title.trim());
    formData.append('caption', uploadFile.caption.trim());

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    // const extension = uploadFile.file.name.split('.').pop();
    const filename = `${timestamp}_${uploadFile.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    formData.append('filename', filename);

    try {
      const authToken = sessionStorage.getItem('admin_auth_token') || defaultAuthToken;
      const response = await fetch(`${uploadApiBase}/api/upload-archive`, {
        method: 'POST',
        headers: {
          'Authorization': authToken
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error || 'Upload failed');
      }

      const successData = (await response.json().catch(() => ({}))) as { item?: ExistingArchiveItem };

      // Update file status to success
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'success', progress: 100 }
          : f
      ));

      if (successData.item?.id) {
        setExistingItems((prev) => [successData.item!, ...prev.filter((item) => item.id !== successData.item!.id)]);
      }
    } catch (error) {
      const fallbackError = `Cannot reach upload server at ${uploadApiBase}. Start it with: node server.cjs`;
      const normalizedError = error instanceof TypeError
        ? fallbackError
        : (error instanceof Error ? error.message : 'Upload failed');

      // Update file status to error
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: normalizedError }
          : f
      ));
    }
  }, [uploadApiBase, defaultAuthToken]);

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
    if (ALLOWED_TYPES.image.includes(file.type as typeof ALLOWED_TYPES.image[number])) {
      return <Image className="w-4 h-4" />;
    } else if (ALLOWED_TYPES.video.includes(file.type as typeof ALLOWED_TYPES.video[number])) {
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
          <a href="/" className="text-sm sm:text-lg font-light hover:text-primary transition-colors">
            <span className="sm:hidden">← home</span>
            <span className="hidden sm:inline">← back to home</span>
          </a>
          <h1 className="text-sm sm:text-lg font-light">archive upload</h1>
          <div className="w-0 sm:w-24"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-8">
            {isApiReachable === false ? (
              <div className="border border-red-400/40 bg-red-500/5 rounded-sm px-4 py-3 text-sm text-red-500 break-words">
                upload api is offline at <code className="font-mono">{uploadApiBase}</code>. run <code className="font-mono">node server.cjs</code> from the project root.
              </div>
            ) : null}

            {/* Page Header */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-light">Archive Upload</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                where Leonardo codes, Michelangelo sculpts in zeros, and new snapshots join the archive of timeless records
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-sm p-6 sm:p-12 text-center transition-all duration-200 ${
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
                  <h3 className="text-base sm:text-lg font-medium mb-2">Drop files here or click to browse</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports images (JPG, PNG, GIF, WebP) and videos (MP4, MOV, WebM)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 50MB
                  </p>
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
                >
                  Choose Files
                </button>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h3 className="text-base sm:text-lg font-medium">Files to Upload ({files.length})</h3>
                  <button
                    onClick={uploadAllFiles}
                    disabled={isUploading || files.every(f => f.status !== 'pending')}
                    className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

                          <div className="mb-2">
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={file.title}
                              onChange={(e) => updateTitle(file.id, e.target.value)}
                              disabled={file.status !== 'pending' || isUploading}
                              placeholder="Name shown on the archive card"
                              className="w-full rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                            />
                          </div>

                          <div className="mb-2">
                            <label className="block text-[11px] text-muted-foreground mb-1">
                              Caption
                            </label>
                            <input
                              type="text"
                              value={file.caption}
                              onChange={(e) => updateCaption(file.id, e.target.value)}
                              disabled={file.status !== 'pending' || isUploading}
                              placeholder="Optional supporting note"
                              className="w-full rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                            />
                          </div>
                          
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

            {/* Existing Archive Items */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-medium">Existing Archive Images ({existingItems.length})</h3>
                <button
                  onClick={() => void loadExistingItems()}
                  disabled={isLoadingExisting || isApiReachable === false}
                  className="w-full sm:w-auto px-3 py-1.5 text-xs border border-border rounded-sm hover:border-primary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingExisting ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {existingError ? (
                <p className="text-xs text-red-500">{existingError}</p>
              ) : null}

              {isLoadingExisting ? (
                <div className="text-sm text-muted-foreground">Loading uploaded images...</div>
              ) : existingItems.length === 0 ? (
                <div className="text-sm text-muted-foreground border border-border/60 rounded-sm p-4">
                  no uploaded images yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {existingItems.map((item) => {
                    const isDeleting = deletingId === item.id;

                    return (
                      <article
                        key={item.id}
                        className="bg-card/50 border border-border/50 rounded-sm overflow-hidden"
                      >
                        <div className="aspect-video bg-muted/40">
                          {item.mediaType === 'video' ? (
                            <video
                              src={getMediaUrl(item.url)}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={getMediaUrl(item.url)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>

                        <div className="p-3 space-y-1.5">
                          <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                          {item.timestamp ? (
                            <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                          ) : null}
                          {item.caption?.trim() ? (
                            <p className="text-xs text-muted-foreground line-clamp-2">{item.caption.trim()}</p>
                          ) : null}
                        </div>

                        <div className="px-3 pb-3">
                          <button
                            onClick={() => void removeExistingItem(item.id)}
                            disabled={isDeleting}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border border-red-500/40 text-red-500 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {isDeleting ? 'Removing...' : 'Remove image'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArchiveUpload;
