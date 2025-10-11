import { createClient } from '@supabase/supabase-js';

// Temporalmente hardcodeadas para debug
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ppujkawteiowcmkkbzri.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5SmRGKvZ1LQ';

console.log('🔍 Supabase URL:', supabaseUrl);
console.log('🔍 Supabase Key (primeros 20 chars):', supabaseAnonKey.substring(0, 20) + '...');

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
