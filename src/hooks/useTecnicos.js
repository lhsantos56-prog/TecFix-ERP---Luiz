import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Busca todos os usuários com perfil 'tecnico' e status ativo.
 * Usado para popular o select de Técnico Responsável nas OS.
 */
export function useTecnicos() {
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('profiles')
      .select('id, nome')
      .eq('role', 'tecnico')
      .eq('ativo', true)
      .order('nome', { ascending: true })
      .then(({ data, error: supaError }) => {
        if (supaError) {
          console.error('[useTecnicos] Erro ao carregar técnicos:', supaError.message);
          setError(supaError.message);
        } else {
          setTecnicos(data || []);
        }
        setLoading(false);
      });
  }, []);

  return { tecnicos, loading, error };
}
