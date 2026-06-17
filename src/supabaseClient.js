import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'AVISO: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam ser configuradas no arquivo .env'
  );
}

// Inicializa o cliente principal do Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
