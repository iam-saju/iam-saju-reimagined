import { useState, useEffect } from 'react';
import AdminAuth from '@/components/AdminAuth';
import ArchiveUpload from '@/components/ArchiveUpload';

const AdminArchive = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = sessionStorage.getItem('admin_authenticated') === 'true';
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-foreground font-sans flex items-center justify-center" style={{ backgroundColor: '#1C1C1C' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="relative">
      <ArchiveUpload />
      
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="fixed bottom-6 right-6 p-3 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-lg z-50"
        title="Logout"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

export default AdminArchive;
