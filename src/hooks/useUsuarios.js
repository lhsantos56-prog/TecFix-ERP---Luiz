import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const ROLES_LABEL = {
  atendente: 'Atendente',
  tecnico: 'Técnico',
  administrador: 'Administrador',
};

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Lista todos os perfis ordenados por nome, incluindo e-mail de auth.users */
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: profiles, error: supaError } = await supabase
        .from('profiles')
        .select('*')
        .order('nome', { ascending: true });

      if (supaError) throw supaError;

      // Mescla e-mails de auth.users (requer service_role key)
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const { SUPABASE_URL } = await import('../supabaseClient');
        const adminClient = createClient(SUPABASE_URL, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        });
        const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        const emailMap = {};
        users?.forEach(u => { emailMap[u.id] = u.email; });
        setUsuarios((profiles || []).map(p => ({ ...p, email: emailMap[p.id] || null })));
      } else {
        setUsuarios(profiles || []);
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria novo usuário.
   * Tenta primeiro via Edge Function (server-side — chave nunca exposta ao cliente).
   * Se a Edge Function ainda não estiver deployada (404), cai no método legado
   * usando supabaseAdmin diretamente (compatibilidade durante a transição).
   */
  const criarUsuario = useCallback(async ({ email, password, nome, role }) => {
    // ── Tenta via Edge Function ────────────────────────────────────────────
    const { data, error: fnError } = await supabase.functions.invoke('create-user', {
      body: { email, password, nome, role },
    });

    // Se a função existir e retornar um erro de negócio, lança normalmente
    if (!fnError && data?.error) throw new Error(data.error);

    // Se a função retornou um usuário, tudo certo
    if (!fnError && data?.user) {
      await new Promise(r => setTimeout(r, 800));
      await fetchUsuarios();
      return data.user;
    }

    // ── Fallback: Edge Function ainda não deployada ────────────────────────
    // Remove este bloco após confirmar que a Edge Function está ativa.
    console.warn('[useUsuarios] Edge Function não disponível, usando fallback local.');
    const { createClient } = await import('@supabase/supabase-js');
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('../supabaseClient');
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      throw new Error(
        'Edge Function "create-user" não encontrada e VITE_SUPABASE_SERVICE_ROLE_KEY não configurada. ' +
        'Faça o deploy da Edge Function ou adicione a key no .env.'
      );
    }

    const adminClient = createClient(SUPABASE_URL, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: adminData, error: adminErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome, role },
    });

    if (adminErr) throw adminErr;
    if (!adminData.user) throw new Error('Falha ao criar usuário.');

    await new Promise(r => setTimeout(r, 800));
    await fetchUsuarios();
    return adminData.user;
  }, [fetchUsuarios]);


  /**
   * Edita nome e role de um perfil; se password fornecido, altera também a senha.
   */
  const editarUsuario = useCallback(async (id, { nome, role, password }) => {
    // Atualiza perfil no banco
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .update({ nome, role })
      .eq('id', id)
      .select()
      .single();

    if (profileErr) throw profileErr;
    setUsuarios(prev => prev.map(u => (u.id === id ? profileData : u)));

    // Altera senha se preenchida
    if (password && password.trim()) {
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) throw new Error('Chave de administrador não configurada para alterar senha.');
      const { createClient } = await import('@supabase/supabase-js');
      const { SUPABASE_URL } = await import('../supabaseClient');
      const adminClient = createClient(SUPABASE_URL, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      const { error: passErr } = await adminClient.auth.admin.updateUserById(id, { password });
      if (passErr) throw passErr;
    }

    return profileData;
  }, []);

  /** Atualiza campos genéricos de um perfil */
  const atualizarPerfil = useCallback(async (id, campos) => {
    const { data, error: supaError } = await supabase
      .from('profiles')
      .update(campos)
      .eq('id', id)
      .select()
      .single();

    if (supaError) throw supaError;
    setUsuarios(prev => prev.map(u => (u.id === id ? data : u)));
    return data;
  }, []);

  /** Ativa ou desativa um usuário (soft toggle) */
  const toggleAtivo = useCallback(async (id, ativo) => {
    return atualizarPerfil(id, { ativo });
  }, [atualizarPerfil]);

  return {
    usuarios,
    loading,
    error,
    fetchUsuarios,
    criarUsuario,
    editarUsuario,
    atualizarPerfil,
    toggleAtivo,
    ROLES_LABEL,
  };
}
