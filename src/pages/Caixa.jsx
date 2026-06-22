import React, { useState } from 'react';
import { formatCurrency } from '../utils/format';
import { CheckCircle, AlertCircle, Banknote } from 'lucide-react';
import { useToast } from '../hooks/useToast';

function Caixa({ ordens, loading, onBaixarPagamento }) {
  const { toast } = useToast();
  // Estado local para armazenar a forma de pagamento selecionada para cada OS
  const [pagamentos, setPagamentos] = useState({});

  const [filtroPagamento, setFiltroPagamento] = useState('Pendente');

  // Filtra as OS que devem aparecer no caixa
  const ordensNoCaixa = ordens.filter(o => {
    if (o.status_aprovacao !== 'Aprovado' || o.status !== 'Finalizada') return false;
    if (filtroPagamento === 'Todos') return true;
    if (filtroPagamento === 'Pago') return o.status_pagamento === 'Pago';
    return o.status_pagamento !== 'Pago'; // Pendente
  });

  const handleSelectFormaPagamento = (id, valor) => {
    setPagamentos(prev => ({ ...prev, [id]: valor }));
  };

  const handleConfirmarPagamento = async (id) => {
    const forma = pagamentos[id];
    if (!forma) {
      toast.error('Selecione uma forma de pagamento antes de confirmar.');
      return;
    }

    try {
      await onBaixarPagamento(id, forma);
      toast.success('Pagamento recebido com sucesso!');
    } catch (err) {
      toast.error(err.message || 'Erro ao registrar pagamento.');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <header className="page-header">
          <div>
            <h1 className="page-title">Caixa</h1>
            <p className="page-subtitle">Contas a Receber</p>
          </div>
        </header>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner spinner-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Caixa</h2>
          <p className="page-description">
            {ordensNoCaixa.length} conta{ordensNoCaixa.length !== 1 ? 's' : ''} a receber ({filtroPagamento.toLowerCase()})
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-chips">
          {['Todos', 'Pendente', 'Pago'].map(opt => (
            <button
              key={opt}
              className={`filter-chip ${filtroPagamento === opt ? 'active' : ''}`}
              onClick={() => setFiltroPagamento(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {ordensNoCaixa.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={48} color="var(--color-finalizada)" style={{ marginBottom: '16px' }} />
          <h3>Nenhuma conta a receber</h3>
          <p>Todas as OS finalizadas já foram pagas ou ainda não foram aprovadas/finalizadas.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '72px', textAlign: 'center' }}>Nº OS</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Forma de Pagamento</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {ordensNoCaixa.map((os) => {
                const numero = ordens.findIndex(o => o.id === os.id) + 1;
                return (
                <tr key={os.id}>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(0,212,255,0.10)',
                      color: 'var(--color-accent)',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      letterSpacing: '0.04em',
                      padding: '3px 7px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0,212,255,0.18)',
                      whiteSpace: 'nowrap',
                    }}>
                      OS-{String(numero).padStart(3, '0')}
                    </span>
                  </td>
                  <td>{os.clientes?.nome || 'Cliente não encontrado'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                    {formatCurrency(os.valor)}
                  </td>
                  <td>
                    {os.status_pagamento === 'Pago' ? (
                      <span style={{ color: 'var(--color-finalizada)', fontWeight: 600 }}>
                        {os.forma_pagamento || 'Pago'}
                      </span>
                    ) : (
                      <select
                        className="status-select"
                        value={pagamentos[os.id] || ''}
                        onChange={(e) => handleSelectFormaPagamento(os.id, e.target.value)}
                        style={{ minWidth: '130px' }}
                      >
                        <option value="" disabled>Selecione...</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="PIX">PIX</option>
                        <option value="Crédito">Cartão de Crédito</option>
                        <option value="Débito">Cartão de Débito</option>
                      </select>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {os.status_pagamento === 'Pago' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        <CheckCircle size={16} style={{ marginRight: '4px', color: 'var(--color-finalizada)' }} />
                        Recebido
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleConfirmarPagamento(os.id)}
                        disabled={!pagamentos[os.id]}
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        <Banknote size={16} style={{ marginRight: '6px' }} />
                        Receber
                      </button>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Caixa;
