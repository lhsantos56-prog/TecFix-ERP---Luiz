import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Busca todos os usuários com perfil 'tecnico' e status ativo.
 * Usado para popular o select de Técnico Responsável nas OS.
 */
export function useTecnicos() {
  const [tecnicos, setTecnicos] = useState([]);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, nome')
      .eq('role', 'tecnico')
      .eq('ativo', true)
      .order('nome', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setTecnicos(data || []);
      });
  }, []);

  return tecnicos;
}
