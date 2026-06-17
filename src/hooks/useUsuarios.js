import { useState, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseClient';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente separado para signup de novos usuários.
 * Não persiste sessão, evitando deslogar o admin atual.
 */
const supabaseSignup = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    storageKey: 'sb-signup-temp',
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

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
   * Cria novo usuário via signUp público (Opção B).
   * Usa cliente separado para não deslogar o admin.
   */
  const criarUsuario = useCallback(async ({ email, password, nome, role }) => {
    const { data, error: supaError } = await supabaseSignup.auth.signUp({
      email,
      password,
      options: {
        data: { nome, role },
      },
    });

    if (supaError) throw supaError;
    if (!data.user) throw new Error('Falha ao criar usuário.');

    // Aguarda trigger criar o profile e busca novamente
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
