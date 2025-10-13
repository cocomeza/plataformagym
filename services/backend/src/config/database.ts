import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

// Cliente para operaciones del usuario autenticado
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente con service role para operaciones administrativas
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Tipos de datos para TypeScript
export interface User {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: 'admin' | 'deportista';
  created_at: string;
  updated_at: string;
  activo: boolean;
}

export interface Session {
  id: string;
  fecha: string;
  descripcion: string;
  activa: boolean;
  created_at: string;
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

export interface QRCode {
  id: string;
  session_id: string;
  codigo: string;
  expira_en: string;
  usado: boolean;
  created_at: string;
}
