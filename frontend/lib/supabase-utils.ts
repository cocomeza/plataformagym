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

export interface SupabasePayment {
  id: string;
  userId: string;
  userName: string;
  monto: number;
  metodo: string;
  concepto: string;
  estado: string;
  fecha: string;
  created_at: string;
  registrado_por: string;
}

export const supabaseUtils = {
  // Función de debugging para listar tablas disponibles
  async listTables(): Promise<void> {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado');
      return;
    }

    try {
      console.log('🔍 Verificando tablas disponibles en Supabase...');
      
      // Intentar acceder a la tabla users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        console.error('❌ Error accediendo a tabla users:', usersError);
      } else {
        console.log('✅ Tabla users accesible');
      }

      // Intentar acceder a la tabla payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .limit(1);
      
      if (paymentsError) {
        console.error('❌ Error accediendo a tabla payments:', paymentsError);
        console.log('💡 La tabla payments no existe o no es accesible');
      } else {
        console.log('✅ Tabla payments accesible');
      }

    } catch (error) {
      console.error('Error de conexión:', error);
    }
  },
  // Obtener todos los usuarios de Supabase
  async getAllUsers(): Promise<SupabaseUser[]> {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, usando datos locales');
      return [];
    }

    try {
      // Intentar diferentes nombres de tabla
      const possibleTables = ['users', 'usuarios', 'profiles', 'auth.users'];
      let data: any[] = [];
      let error: any = null;

      for (const tableName of possibleTables) {
        console.log(`🔍 Intentando tabla: ${tableName}`);
        const result = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });

        if (!result.error) {
          console.log(`✅ Tabla encontrada: ${tableName}`);
          data = result.data || [];
          break;
        } else {
          console.log(`❌ Tabla ${tableName} no encontrada:`, result.error.message);
          error = result.error;
        }
      }

      if (error && data.length === 0) {
        console.error('Error obteniendo usuarios de Supabase:', error);
        return [];
      }

      // Mapear los datos al formato esperado
      const mappedUsers = data.map((user: any) => ({
        id: user.id || user.user_id,
        nombre: user.nombre || user.name || user.full_name || user.email?.split('@')[0] || 'Usuario',
        email: user.email,
        telefono: user.telefono || user.phone || user.telefono || '',
        rol: user.rol || 'deportista',
        activo: user.activo !== undefined ? user.activo : true,
        created_at: user.created_at || new Date().toISOString()
      }));

      console.log('👥 Usuarios mapeados:', mappedUsers);
      return mappedUsers;
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
        .from('users')
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
        .from('users')
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
        .from('users')
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
  },

  // Obtener todos los pagos de Supabase
  async getAllPayments(): Promise<SupabasePayment[]> {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, usando datos locales');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          users:userId (nombre)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo pagos de Supabase:', error);
        console.log('💡 Usando datos locales como fallback');
        return [];
      }

      // Mapear los datos al formato esperado
      const mappedPayments = (data || []).map((payment: any) => ({
        id: payment.id,
        userId: payment.userId,
        userName: payment.users?.nombre || 'Usuario',
        monto: payment.monto,
        metodo: payment.metodo,
        concepto: payment.concepto,
        estado: payment.estado || 'Completado',
        fecha: payment.fecha || payment.created_at,
        created_at: payment.created_at,
        registrado_por: payment.registrado_por || 'Admin'
      }));

      console.log('💰 Pagos obtenidos:', mappedPayments);
      return mappedPayments;
    } catch (error) {
      console.error('Error de conexión con Supabase:', error);
      console.log('💡 Usando datos locales como fallback');
      return [];
    }
  },

  // Agregar nuevo pago
  async addPayment(payment: Omit<SupabasePayment, 'id' | 'created_at'>): Promise<boolean> {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          userId: payment.userId,
          monto: payment.monto,
          metodo: payment.metodo,
          concepto: payment.concepto,
          estado: payment.estado || 'Completado',
          fecha: payment.fecha || new Date().toISOString(),
          registrado_por: payment.registrado_por || 'Admin',
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error agregando pago en Supabase:', error);
        console.log('💡 La tabla payments no existe, usando almacenamiento local');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error de conexión con Supabase:', error);
      console.log('💡 Usando almacenamiento local como fallback');
      return false;
    }
  }
};
