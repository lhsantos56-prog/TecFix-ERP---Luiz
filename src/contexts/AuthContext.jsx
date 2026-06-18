import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

/**
 * Provedor de autenticação — envolve toda a aplicação
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /** Carrega o perfil do usuário a partir da tabela profiles */
  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Erro ao carregar perfil:', error.message, error.code);
        setProfile(null);
        return;
      }
      setProfile(data);
    } catch (err) {
      console.error('[AuthContext] Exceção ao carregar perfil:', err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Verifica sessão existente ao montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user?.id ?? null).finally(() => setLoading(false));
    });

    // Escuta mudanças de auth em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        await loadProfile(session?.user?.id ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = {
    user,
    profile,
    role: profile?.role ?? null,        // 'atendente' | 'tecnico' | 'administrador'
    nomeUsuario: profile?.nome ?? user?.email ?? '',
    ativo: profile?.ativo ?? null,  // null = perfil não carregado ainda; false = desativado pelo admin
    loading,
    signOut,
    reloadProfile: () => loadProfile(user?.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
