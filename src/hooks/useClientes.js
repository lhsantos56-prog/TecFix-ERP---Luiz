import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Hook para gerenciar operações CRUD de clientes
 */
export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supaError } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (supaError) throw supaError;
      setClientes(data || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const criarCliente = useCallback(async (clienteData) => {
    const { data, error: supaError } = await supabase
      .from('clientes')
      .insert([clienteData])
      .select()
      .single();

    if (supaError) throw supaError;

    setClientes(prev => [data, ...prev]);
    return data;
  }, []);

  const deletarCliente = useCallback(async (id) => {
    const { error: supaError } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (supaError) throw supaError;

    setClientes(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    clientes,
    loading,
    error,
    fetchClientes,
    criarCliente,
    deletarCliente,
  };
}
