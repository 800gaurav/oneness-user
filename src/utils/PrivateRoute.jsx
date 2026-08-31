import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Show loading only if we're still checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-surface))]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[rgb(var(--color-text-secondary))]">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}