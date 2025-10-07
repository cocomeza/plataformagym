'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from './supabase';
import { supabaseUtils, SupabaseUser } from './supabase-utils';

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

  // Verificar sesión de Supabase al cargar la app
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Obtener sesión actual de Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Usuario autenticado, obtener datos completos del usuario
          const supabaseUser = await supabaseUtils.getUserById(session.user.id);
          
          if (supabaseUser) {
            setUser({
              id: supabaseUser.id,
              nombre: supabaseUser.nombre,
              email: supabaseUser.email,
              rol: supabaseUser.rol
            });
            console.log('✅ Usuario autenticado desde Supabase:', supabaseUser);
          } else {
            // El usuario existe en Auth pero no en la tabla users
            console.warn('⚠️ Usuario autenticado pero sin registro completo');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios en la sesión de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Cambio en estado de autenticación:', event);
      
      if (session?.user) {
        const supabaseUser = await supabaseUtils.getUserById(session.user.id);
        if (supabaseUser) {
          setUser({
            id: supabaseUser.id,
            nombre: supabaseUser.nombre,
            email: supabaseUser.email,
            rol: supabaseUser.rol
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Autenticar con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Error en login:', authError);
        toast.error('Credenciales incorrectas');
        return false;
      }

      if (authData.user) {
        // Obtener datos completos del usuario desde la tabla users
        const supabaseUser = await supabaseUtils.getUserById(authData.user.id);
        
        if (supabaseUser) {
          setUser({
            id: supabaseUser.id,
            nombre: supabaseUser.nombre,
            email: supabaseUser.email,
            rol: supabaseUser.rol
          });
          toast.success(`¡Bienvenido, ${supabaseUser.nombre}!`);
          console.log('✅ Login exitoso con Supabase:', supabaseUser);
          return true;
        } else {
          toast.error('Usuario no encontrado en la base de datos');
          await supabase.auth.signOut();
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error de conexión con Supabase');
      return false;
    }
  };

  const register = async (nombre: string, email: string, password: string): Promise<boolean> => {
    try {
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: nombre,
          }
        }
      });

      if (authError) {
        console.error('Error en registro:', authError);
        toast.error(authError.message || 'Error al crear la cuenta');
        return false;
      }

      if (authData.user) {
        // Crear registro en la tabla users
        const success = await supabaseUtils.addUser({
          nombre,
          email,
          telefono: '',
          rol: 'deportista', // Por defecto los nuevos usuarios son deportistas
          activo: true
        });

        if (success) {
          // Obtener datos completos del usuario
          const supabaseUser = await supabaseUtils.getUserById(authData.user.id);
          
          if (supabaseUser) {
            setUser({
              id: supabaseUser.id,
              nombre: supabaseUser.nombre,
              email: supabaseUser.email,
              rol: supabaseUser.rol
            });
            toast.success('¡Cuenta creada exitosamente!');
            console.log('✅ Registro exitoso con Supabase:', supabaseUser);
            return true;
          }
        } else {
          // Si falla la creación en la tabla users, eliminar el usuario de Auth
          await supabase.auth.signOut();
          toast.error('Error al completar el registro');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error('Error de conexión con Supabase');
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        toast.error('Error al cerrar sesión');
      } else {
        setUser(null);
        toast.success('Sesión cerrada');
        router.push('/');
        console.log('✅ Sesión cerrada exitosamente');
      }
    } catch (error) {
      console.error('Error en logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refrescando sesión:', error);
        return false;
      }
      
      return !!data.session;
    } catch (error) {
      console.error('Error en refreshToken:', error);
      return false;
    }
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
