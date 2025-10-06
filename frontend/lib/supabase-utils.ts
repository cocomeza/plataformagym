// Utilidades para conectar con Supabase
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Crear cliente de Supabase solo si las variables están disponibles
let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export interface SupabaseUser {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'admin' | 'deportista';
  activo: boolean;
  created_at: string;
}

export const supabaseUtils = {
  // Obtener todos los usuarios de Supabase
  async getAllUsers(): Promise<SupabaseUser[]> {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, usando datos locales');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo usuarios de Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error de conexión con Supabase:', error);
      return [];
    }
  },

  // Obtener usuario por ID
  async getUserById(id: string): Promise<SupabaseUser | null> {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error obteniendo usuario de Supabase:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error de conexión con Supabase:', error);
      return null;
    }
  },

  // Actualizar estado de usuario
  async updateUserStatus(id: string, activo: boolean): Promise<boolean> {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo })
        .eq('id', id);

      if (error) {
        console.error('Error actualizando usuario en Supabase:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error de conexión con Supabase:', error);
      return false;
    }
  },

  // Agregar nuevo usuario
  async addUser(user: Omit<SupabaseUser, 'id' | 'created_at'>): Promise<boolean> {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .insert([{
          ...user,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error agregando usuario en Supabase:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error de conexión con Supabase:', error);
      return false;
    }
  }
};
