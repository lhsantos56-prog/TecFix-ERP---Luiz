// supabase/functions/create-user/index.ts
// Edge Function — roda 100% server-side no Supabase
// A service_role key NUNCA é enviada ao cliente

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    // ── 1. Verifica token do chamador ─────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    // Cliente com a sessão do usuário atual (para verificar role)
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

    // ── 2. Verifica se o chamador é Administrador ─────────────────────────
    // Cliente admin com service_role (SOMENTE no servidor — nunca exposto ao cliente)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'administrador') {
      return json({ error: 'Forbidden: apenas administradores podem criar usuários' }, 403);
    }

    // ── 3. Cria o usuário com Admin API ───────────────────────────────────
    const { email, password, nome, role } = await req.json();

    // Validações básicas
    if (!email || !password || !nome || !role) {
      return json({ error: 'Campos obrigatórios: email, password, nome, role' }, 400);
    }
    if (!['atendente', 'tecnico', 'administrador'].includes(role)) {
      return json({ error: 'Role inválida' }, 400);
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,          // cria já confirmado — sem e-mail
      user_metadata: { nome, role },
    });

    if (error) return json({ error: error.message }, 400);

    return json({ user: { id: data.user.id, email: data.user.email } });

  } catch (err) {
    return json({ error: (err as Error).message || 'Erro interno' }, 500);
  }
});
