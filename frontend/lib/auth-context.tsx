'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabaseUtils } from './supabase-utils';
import { supabase } from './supabase';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'deportista';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<boolean>;
  register: (nombre: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (nombre: string, email: string, password: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar token al cargar la app
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verificar si el token es válido
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 > Date.now()) {
            // Token válido, obtener datos del usuario
            const userData = localStorage.getItem('user');
            if (userData) {
              setUser(JSON.parse(userData));
            }
          } else {
            // Token expirado, limpiar datos
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          // Token inválido, limpiar datos
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🚀 Iniciando login con Supabase:', { email });
      
      // 1. Autenticar con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('❌ Error de autenticación:', authError);
        toast.error(authError.message || 'Credenciales incorrectas');
        return false;
      }

      if (!authData.user) {
        toast.error('Error al obtener datos del usuario');
        return false;
      }

      // 2. Obtener datos del usuario desde la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        console.error('❌ Error obteniendo datos del usuario:', userError);
        toast.error('Usuario no encontrado en la base de datos');
        return false;
      }

      // 3. Verificar que el usuario esté activo
      if (!userData.activo) {
        toast.error('Tu cuenta está desactivada');
        return false;
      }

      // 4. Crear objeto de usuario para el frontend
      const frontendUser = {
        id: userData.id,
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol
      };

      // 5. Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(frontendUser));
      setUser(frontendUser);
      
      console.log('✅ Login exitoso:', frontendUser);
      toast.success('¡Bienvenido!');
      return true;

    } catch (error) {
      console.error('💥 Error en login:', error);
      toast.error('Error de conexión con el servidor');
      return false;
    }
  };

  const register = async (nombre: string, email: string, password: string): Promise<boolean> => {
    try {
      // 1. Registrar con backend de Render
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gym-platform-backend.onrender.com';
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 2. Guardar token y usuario en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        // 3. Sincronizar usuario con Supabase
        try {
          await supabaseUtils.syncUserWithSupabase(data.user);
          console.log('✅ Usuario registrado y sincronizado con Supabase');
        } catch (syncError) {
          console.warn('⚠️ Error sincronizando con Supabase:', syncError);
          // No fallar el registro por esto
        }
        
        toast.success('¡Cuenta creada exitosamente!');
        return true;
      } else {
        console.error('Error del backend:', data);
        toast.error(data.error || 'Error al crear la cuenta');
        return false;
      }
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error('Error de conexión con el servidor');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Sesión cerrada');
    router.push('/');
  };

  const refreshToken = async (): Promise<boolean> => {
    // Por ahora, simplemente retornar false ya que no implementamos refresh token
    return false;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    signOut: logout,
    signIn: login,
    signUp: register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
