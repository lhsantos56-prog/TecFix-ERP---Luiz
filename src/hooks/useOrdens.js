import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Hook para gerenciar operações CRUD de ordens de serviço
 */

// Definido fora do hook para não recriar a string a cada render
const SELECT_FIELDS = `
  *,
  tipo_equipamento,
  status_aprovacao,
  clientes ( id, nome, email, telefone )
`;

export function useOrdens() {
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrdens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supaError } = await supabase
        .from('ordens_servico')
        .select(SELECT_FIELDS)
        .order('created_at', { ascending: true });

      if (supaError) throw supaError;
      setOrdens(data || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar ordens de serviço.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchOrdens();
  }, [fetchOrdens]);

  const criarOrdem = useCallback(async (ordemData) => {
    const { data, error: supaError } = await supabase
      .from('ordens_servico')
      .insert([{
        ...ordemData,
        status: 'Pendente',
        status_aprovacao: 'Aguardando',
        valor: ordemData.valor ?? 0,
      }])
      .select(SELECT_FIELDS)
      .single();

    if (supaError) throw supaError;
    setOrdens(prev => [...prev, data]);  // mantém ordem de chegada (mais recente no fim)
    return data;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const atualizarOrdem = useCallback(async (id, campos) => {
    const tryUpdate = async (payload) => {
      const { data, error: supaError } = await supabase
        .from('ordens_servico')
        .update(payload)
        .eq('id', id)
        .select(SELECT_FIELDS)
        .single();
      return { data, error: supaError };
    };

    let { data, error: supaError } = await tryUpdate(campos);

    // Se o erro é que tecnico_id ainda não existe no banco (migração pendente),
    // retenta sem o campo para não bloquear os demais salvamentos.
    if (supaError && supaError.message?.includes('tecnico_id')) {
      const { tecnico_id, ...camposSemTecnico } = campos; // eslint-disable-line no-unused-vars
      ({ data, error: supaError } = await tryUpdate(camposSemTecnico));
    }

    if (supaError) throw supaError;
    setOrdens(prev => prev.map(o => (o.id === id ? data : o)));
    return data;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const atualizarStatus = useCallback(async (id, novoStatus) => {
    const { data, error: supaError } = await supabase
      .from('ordens_servico')
      .update({ status: novoStatus })
      .eq('id', id)
      .select(SELECT_FIELDS)
      .single();

    if (supaError) throw supaError;
    setOrdens(prev => prev.map(o => (o.id === id ? data : o)));
    return data;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const atualizarAprovacao = useCallback(async (id, novoStatusAprovacao) => {
    const { data, error: supaError } = await supabase
      .from('ordens_servico')
      .update({ status_aprovacao: novoStatusAprovacao })
      .eq('id', id)
      .select(SELECT_FIELDS)
      .single();

    if (supaError) throw supaError;
    setOrdens(prev => prev.map(o => (o.id === id ? data : o)));
    return data;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const deletarOrdem = useCallback(async (id) => {
    const { error: supaError } = await supabase
      .from('ordens_servico')
      .delete()
      .eq('id', id);

    if (supaError) throw supaError;
    setOrdens(prev => prev.filter(o => o.id !== id));
  }, []);

  return {
    ordens,
    loading,
    error,
    fetchOrdens,
    criarOrdem,
    atualizarOrdem,
    atualizarStatus,
    atualizarAprovacao,
    deletarOrdem,
  };
}
