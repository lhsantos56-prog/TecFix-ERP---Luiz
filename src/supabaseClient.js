import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'AVISO: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam ser configuradas no arquivo .env'
  );
}

// Cliente principal (anon key) — usado por toda a aplicação
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ⚠️  supabaseAdmin foi removido do cliente.
// A criação de usuários é feita via Edge Function 'create-user' (server-side).
// Veja: supabase/functions/create-user/index.ts
