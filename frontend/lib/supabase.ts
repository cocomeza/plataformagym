import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para TypeScript
export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'deportista';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  session_id: string;
  metodo: 'qr' | 'manual';
  fecha_hora: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  fecha: string;
  monto: number;
  metodo: 'efectivo' | 'transferencia';
  estado: 'pagado' | 'pendiente';
  descripcion?: string;
  created_at: string;
  updated_at: string;
}
