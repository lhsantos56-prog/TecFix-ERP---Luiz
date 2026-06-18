import { useState, useCallback } from 'react';
import { supabase, supabaseAdmin } from '../supabaseClient';

const ROLES_LABEL = {
  atendente: 'Atendente',
  tecnico: 'Técnico',
  administrador: 'Administrador',
};

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Lista todos os perfis ordenados por nome */
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supaError } = await supabase
        .from('profiles')
        .select('*')
        .order('nome', { ascending: true });

      if (supaError) throw supaError;
      setUsuarios(data || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria novo usuário via Admin API.
   * email_confirm: true → usuário já é criado confirmado, sem envio de e-mail.
   * Requer supabaseAdmin (service_role key).
   */
  const criarUsuario = useCallback(async ({ email, password, nome, role }) => {
    if (!supabaseAdmin) {
      throw new Error('Admin client não configurado. Verifique VITE_SUPABASE_SERVICE_ROLE_KEY no .env');
    }

    const { data, error: supaError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,          // ← cria já confirmado, sem e-mail
      user_metadata: { nome, role },
    });

    if (supaError) throw supaError;
    if (!data.user) throw new Error('Falha ao criar usuário.');

    // Aguarda o trigger de banco criar o perfil automaticamente
    await new Promise(r => setTimeout(r, 800));
    await fetchUsuarios();
    return data.user;
  }, [fetchUsuarios]);


  /** Atualiza nome, role ou ativo de um perfil */
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
    atualizarPerfil,
    toggleAtivo,
    ROLES_LABEL,
  };
}
