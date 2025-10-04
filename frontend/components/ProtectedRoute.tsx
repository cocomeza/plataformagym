'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'deportista';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && user.rol !== requiredRole) {
        // Redirigir según el rol
        if (user.rol === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      setIsChecking(false);
    }
  }, [user, loading, requiredRole, redirectTo, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (ya se redirigió)
  if (!user) {
    return null;
  }

  // Si el rol no coincide, no renderizar nada (ya se redirigió)
  if (requiredRole && user.rol !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
