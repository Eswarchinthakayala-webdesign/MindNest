import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-950 text-primary">
         <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
