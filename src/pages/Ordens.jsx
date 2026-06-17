import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  AlertCircle,
  Loader2,
  ClipboardList,
  DollarSign,
  User,
  FileText,
  Calendar,
  Cpu,
  Pencil,
  Lock,
} from 'lucide-react';
import Modal from '../components/ui/Modal';

const STATUS_CONSERTO_OPTIONS = ['Pendente', 'Em Andamento', 'Finalizada', 'Cancelada'];
const STATUS_APROVACAO_OPTIONS = ['Aguardando', 'Aprovado', 'Reprovado'];
const FILTER_OPTIONS = ['Todos', ...STATUS_CONSERTO_OPTIONS];

// Equipamentos em ordem alfabética (pt-BR)
const EQUIPAMENTOS = [
  'Áudio/Som',
  'Celular',
  'Console',
  'Desktop',
  'Notebook',
  'Outro',
  'Tablet',
  'Televisão',
];

/**
 * Formata valor para moeda BRL
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

/**
 * Formata data para pt-BR
 */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

/**
 * Badge de status do conserto
 */
function StatusBadge({ status }) {
  const classMap = {
    'Pendente': 'badge-pendente',
    'Em Andamento': 'badge-andamento',
    'Finalizada': 'badge-finalizada',
    'Cancelada': 'badge-cancelada',
  };
  return (
    <span className={`badge ${classMap[status] || ''}`}>
      {status}
    </span>
  );
}

/**
 * Badge de status de aprovação
 */
function AprovacaoBadge({ status }) {
  const classMap = {
    'Aguardando': 'badge-aguardando',
    'Aprovado': 'badge-aprovado',
    'Reprovado': 'badge-reprovado',
  };
  return (
    <span className={`badge ${classMap[status] || 'badge-aguardando'}`}>
      {status || 'Aguardando'}
    </span>
  );
}

const INITIAL_CREATE_FORM = {
  cliente_id: '',
  descricao: '',
  valor: '',
  tipo_equipamento: 'Celular',
};

/** Valida formulário de CRIAÇÃO (valor opcional) */
function validateCriarForm(fields) {
  const errors = {};
  if (!fields.cliente_id) errors.cliente_id = 'Selecione um cliente.';
  if (!fields.descricao.trim()) errors.descricao = 'Descrição é obrigatória.';
  if (!fields.tipo_equipamento) errors.tipo_equipamento = 'Selecione o tipo de equipamento.';
  if (fields.valor !== '' && fields.valor !== undefined) {
    const num = parseFloat(fields.valor);
    if (isNaN(num) || num < 0) errors.valor = 'Se informado, o valor deve ser um número positivo.';
  }
  return errors;
}

/** Valida formulário de EDIÇÃO (valor obrigatório) */
function validateEditarForm(fields) {
  const errors = {};
  if (!fields.cliente_id) errors.cliente_id = 'Selecione um cliente.';
  if (!fields.tipo_equipamento) errors.tipo_equipamento = 'Selecione o tipo de equipamento.';
  if (!fields.status) errors.status = 'Selecione um status.';
  if (fields.valor === '' || fields.valor === undefined || fields.valor === null) {
    errors.valor = 'Informe o valor da OS.';
  } else {
    const num = parseFloat(fields.valor);
    if (isNaN(num) || num < 0) errors.valor = 'O valor deve ser um número positivo.';
  }
  return errors;
}

/**
 * Separador usado ao salvar novas observações no histórico de descrição
 */
const OBS_SEPARATOR = '\n\n— Observação';

/**
 * Página de Gestão de Ordens de Serviço
 */
function Ordens({ ordens, clientes, loading, error, onCriar, onAtualizar, onAtualizarStatus, onAtualizarAprovacao }) {
  // Estados do modal de criação
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(INITIAL_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // Estados do modal de edição
  const [editingOrdem, setEditingOrdem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editing, setEditing] = useState(false);

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [updatingId, setUpdatingId] = useState(null);
  const [updatingAprovacaoId, setUpdatingAprovacaoId] = useState(null);

  // Clientes em ordem alfabética (pt-BR)
  const clientesOrdenados = useMemo(() =>
    [...clientes].sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
    ), [clientes]
  );

  const filteredOrdens = useMemo(() => {
    return ordens.filter(o => {
      const matchStatus = statusFilter === 'Todos' || o.status === statusFilter;
      const term = search.toLowerCase();
      const matchSearch =
        !term ||
        (o.clientes?.nome || '').toLowerCase().includes(term) ||
        o.descricao.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [ordens, statusFilter, search]);

  /* ── Criação ── */
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
    if (createErrors[name]) setCreateErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCriarForm(createForm);
    if (Object.keys(errors).length > 0) { setCreateErrors(errors); return; }
    setCreating(true);
    try {
      await onCriar({
        cliente_id: createForm.cliente_id,
        descricao: createForm.descricao.trim(),
        tipo_equipamento: createForm.tipo_equipamento,
        valor: createForm.valor !== '' ? parseFloat(createForm.valor) : 0,
      });
      setCreateForm(INITIAL_CREATE_FORM);
      setCreateErrors({});
      setIsCreateOpen(false);
    } catch (err) {
      setCreateErrors({ general: err.message || 'Erro ao criar OS.' });
    } finally {
      setCreating(false);
    }
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setCreateForm(INITIAL_CREATE_FORM);
    setCreateErrors({});
  };

  /* ── Edição ── */
  const openEdit = (ordem) => {
    setEditingOrdem(ordem);
    setEditForm({
      cliente_id: ordem.cliente_id,
      tipo_equipamento: ordem.tipo_equipamento || 'Outro',
      valor: ordem.valor != null ? String(ordem.valor) : '',
      status: ordem.status,
      status_aprovacao: ordem.status_aprovacao || 'Aguardando',
      // Descrição original: somente leitura (bloqueada)
      descricao_locked: ordem.descricao,
      // Nova observação: editável pelo técnico
      descricao_nova: '',
    });
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    if (editErrors[name]) setEditErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateEditarForm(editForm);
    if (Object.keys(errors).length > 0) { setEditErrors(errors); return; }
    setEditing(true);
    try {
      // Monta descrição completa: original + nova observação (se houver)
      const novaObs = editForm.descricao_nova.trim();
      const dataAtual = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
      const descricaoFinal = editForm.descricao_locked +
        (novaObs ? `${OBS_SEPARATOR} (${dataAtual}):\n${novaObs}` : '');

      await onAtualizar(editingOrdem.id, {
        cliente_id: editForm.cliente_id,
        descricao: descricaoFinal,
        tipo_equipamento: editForm.tipo_equipamento,
        valor: parseFloat(editForm.valor),
        status: editForm.status,
        status_aprovacao: editForm.status_aprovacao || 'Aguardando',
      });
      setEditingOrdem(null);
    } catch (err) {
      setEditErrors({ general: err.message || 'Erro ao atualizar OS.' });
    } finally {
      setEditing(false);
    }
  };

  const handleCloseEdit = () => {
    setEditingOrdem(null);
    setEditErrors({});
  };

  /* ── Status inline ── */
  const handleStatusChange = async (id, novoStatus) => {
    setUpdatingId(id);
    try {
      await onAtualizarStatus(id, novoStatus);
    } catch {
      // toast exibido no App
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAprovacaoChange = async (id, novoStatus) => {
    setUpdatingAprovacaoId(id);
    try {
      await onAtualizarAprovacao(id, novoStatus);
    } catch {
      // toast exibido no App
    } finally {
      setUpdatingAprovacaoId(null);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Ordens de Serviço</h2>
          <p className="page-description">
            {loading ? 'Carregando...' : `${filteredOrdens.length} de ${ordens.length} OS exibida${filteredOrdens.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button id="btn-nova-os" className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />Nova OS
        </button>
      </div>

      {/* Erro geral */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 18px', borderRadius: '10px', marginBottom: '20px',
          background: 'var(--color-cancelada-bg)', border: '1px solid var(--color-cancelada-border)',
          color: 'var(--color-cancelada)', fontSize: '0.875rem',
        }}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={16} />
          <input
            id="os-search" className="form-control" type="text"
            placeholder="Buscar por cliente ou descrição..."
            value={search} onChange={e => setSearch(e.target.value)}
            aria-label="Buscar ordens de serviço"
          />
        </div>
        <div className="filter-chips">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt}
              id={`filter-${opt.replace(' ', '-').toLowerCase()}`}
              className={`filter-chip ${statusFilter === opt ? 'active' : ''}`}
              onClick={() => setStatusFilter(opt)}
              aria-pressed={statusFilter === opt}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner spinner-lg" />
          <span>Carregando ordens de serviço...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredOrdens.length === 0 && (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon"><ClipboardList size={48} strokeWidth={1} /></div>
            <p className="empty-state-title">
              {search || statusFilter !== 'Todos' ? 'Nenhuma OS encontrada' : 'Nenhuma OS cadastrada'}
            </p>
            <p className="empty-state-text">
              {search || statusFilter !== 'Todos'
                ? 'Tente ajustar os filtros ou termo de busca.'
                : 'Clique em "Nova OS" para criar a primeira.'}
            </p>
          </div>
        </div>
      )}

      {/* Tabela */}
      {!loading && filteredOrdens.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table" aria-label="Lista de ordens de serviço">
            <thead>
              <tr>
                <th>Equipamento</th>
                <th>Cliente</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Status do Conserto</th>
                <th>Status Aprovação</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrdens.map(ordem => (
                <tr key={ordem.id}>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {ordem.tipo_equipamento || '—'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-accent), #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.72rem', fontWeight: 700, color: '#0a0f1e', flexShrink: 0,
                      }}>
                        {(ordem.clientes?.nome || '?').charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{ordem.clientes?.nome || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      color: 'var(--color-text-secondary)', maxWidth: '200px',
                      display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }} title={ordem.descricao}>
                      {ordem.descricao}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--color-finalizada)' }}>
                      {formatCurrency(ordem.valor)}
                    </span>
                  </td>
                  <td><StatusBadge status={ordem.status} /></td>
                  <td><AprovacaoBadge status={ordem.status_aprovacao} /></td>
                  <td>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {formatDate(ordem.created_at)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* Select Status do Conserto */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', width: '56px', flexShrink: 0 }}>Conserto</span>
                        {updatingId === ordem.id ? (
                          <Loader2 size={14} className="spin-animation" style={{ color: 'var(--color-accent)' }} />
                        ) : (
                          <select
                            id={`status-select-${ordem.id}`}
                            className="status-select"
                            value={ordem.status}
                            onChange={e => handleStatusChange(ordem.id, e.target.value)}
                            aria-label={`Alterar status do conserto da OS de ${ordem.clientes?.nome}`}
                            disabled={updatingId !== null || updatingAprovacaoId !== null}
                          >
                            {STATUS_CONSERTO_OPTIONS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Select Status Aprovação */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', width: '56px', flexShrink: 0 }}>Aprovação</span>
                        {updatingAprovacaoId === ordem.id ? (
                          <Loader2 size={14} className="spin-animation" style={{ color: 'var(--color-aguardando)' }} />
                        ) : (
                          <select
                            id={`aprovacao-select-${ordem.id}`}
                            className="status-select"
                            value={ordem.status_aprovacao || 'Aguardando'}
                            onChange={e => handleAprovacaoChange(ordem.id, e.target.value)}
                            aria-label={`Alterar status de aprovação da OS de ${ordem.clientes?.nome}`}
                            disabled={updatingId !== null || updatingAprovacaoId !== null}
                          >
                            {STATUS_APROVACAO_OPTIONS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Botão Editar */}
                    <button
                      id={`btn-editar-os-${ordem.id}`}
                      className="btn btn-secondary btn-icon"
                      onClick={() => openEdit(ordem)}
                      title="Editar OS"
                      aria-label={`Editar OS de ${ordem.clientes?.nome}`}
                      disabled={updatingId !== null || updatingAprovacaoId !== null}
                      style={{ marginTop: '6px' }}
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MODAL — NOVA OS (CRIAÇÃO)
          ═══════════════════════════════════════ */}
      <Modal
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        title="Nova Ordem de Serviço"
        subtitle="Registre um novo chamado técnico"
        footer={
          <>
            <button id="btn-cancelar-os" className="btn btn-secondary" onClick={handleCloseCreate} disabled={creating}>
              Cancelar
            </button>
            <button id="btn-salvar-os" className="btn btn-primary" onClick={handleCreateSubmit} disabled={creating}>
              {creating ? <><Loader2 size={16} className="spin-animation" />Salvando...</> : <><Plus size={16} />Criar OS</>}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} noValidate>
          {createErrors.general && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px',
              background: 'var(--color-cancelada-bg)', border: '1px solid var(--color-cancelada-border)',
              color: 'var(--color-cancelada)', fontSize: '0.82rem',
            }}>
              <AlertCircle size={14} /><span>{createErrors.general}</span>
            </div>
          )}

          {/* Cliente — ordem alfabética */}
          <div className="form-group">
            <label htmlFor="os-cliente" className="form-label">
              <User size={12} style={{ display: 'inline', marginRight: '4px' }} />Cliente *
            </label>
            <select
              id="os-cliente" name="cliente_id"
              className={`form-control ${createErrors.cliente_id ? 'error' : ''}`}
              value={createForm.cliente_id} onChange={handleCreateChange}
            >
              <option value="">Selecione um cliente...</option>
              {clientesOrdenados.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {createErrors.cliente_id && (
              <span className="form-error"><AlertCircle size={12} />{createErrors.cliente_id}</span>
            )}
            {clientes.length === 0 && (
              <span className="form-error" style={{ color: 'var(--color-pendente)' }}>
                <AlertCircle size={12} />Cadastre um cliente antes de criar uma OS.
              </span>
            )}
          </div>

          {/* Tipo de Equipamento — ordem alfabética */}
          <div className="form-group">
            <label htmlFor="os-equipamento" className="form-label">
              <Cpu size={12} style={{ display: 'inline', marginRight: '4px' }} />Tipo de Equipamento *
            </label>
            <select
              id="os-equipamento" name="tipo_equipamento"
              className={`form-control ${createErrors.tipo_equipamento ? 'error' : ''}`}
              value={createForm.tipo_equipamento} onChange={handleCreateChange}
            >
              {EQUIPAMENTOS.map(eq => <option key={eq} value={eq}>{eq}</option>)}
            </select>
            {createErrors.tipo_equipamento && (
              <span className="form-error"><AlertCircle size={12} />{createErrors.tipo_equipamento}</span>
            )}
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label htmlFor="os-descricao" className="form-label">
              <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Descrição do problema *
            </label>
            <textarea
              id="os-descricao" name="descricao"
              className={`form-control ${createErrors.descricao ? 'error' : ''}`}
              placeholder="Descreva o defeito ou problema relatado pelo cliente..."
              value={createForm.descricao} onChange={handleCreateChange} rows={3}
            />
            {createErrors.descricao && (
              <span className="form-error"><AlertCircle size={12} />{createErrors.descricao}</span>
            )}
          </div>

          {/* Valor — opcional */}
          <div className="form-group">
            <label htmlFor="os-valor" className="form-label">
              <DollarSign size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Valor (R$)
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '0.7rem' }}>
                — opcional ao criar
              </span>
            </label>
            <input
              id="os-valor" name="valor" type="number" step="0.01" min="0"
              className={`form-control ${createErrors.valor ? 'error' : ''}`}
              placeholder="Ex: 150.00 (pode preencher depois ao editar)"
              value={createForm.valor} onChange={handleCreateChange}
            />
            {createErrors.valor && (
              <span className="form-error"><AlertCircle size={12} />{createErrors.valor}</span>
            )}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '8px',
            background: 'var(--color-pendente-bg)', border: '1px solid var(--color-pendente-border)',
            fontSize: '0.8rem', color: 'var(--color-pendente)',
          }}>
            <Calendar size={13} />
            <span>O status inicial da OS será automaticamente <strong>Pendente</strong>.</span>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════
          MODAL — EDITAR OS
          ═══════════════════════════════════════ */}
      <Modal
        isOpen={!!editingOrdem}
        onClose={handleCloseEdit}
        title="Editar Ordem de Serviço"
        subtitle={editingOrdem ? `OS de ${editingOrdem.clientes?.nome || 'cliente'}` : ''}
        footer={
          <>
            <button id="btn-cancelar-editar-os" className="btn btn-secondary" onClick={handleCloseEdit} disabled={editing}>
              Cancelar
            </button>
            <button id="btn-salvar-editar-os" className="btn btn-primary" onClick={handleEditSubmit} disabled={editing}>
              {editing ? <><Loader2 size={16} className="spin-animation" />Salvando...</> : <><Pencil size={16} />Salvar Alterações</>}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} noValidate>
          {editErrors.general && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px',
              background: 'var(--color-cancelada-bg)', border: '1px solid var(--color-cancelada-border)',
              color: 'var(--color-cancelada)', fontSize: '0.82rem',
            }}>
              <AlertCircle size={14} /><span>{editErrors.general}</span>
            </div>
          )}

          {/* Cliente — ordem alfabética */}
          <div className="form-group">
            <label htmlFor="edit-os-cliente" className="form-label">
              <User size={12} style={{ display: 'inline', marginRight: '4px' }} />Cliente *
            </label>
            <select
              id="edit-os-cliente" name="cliente_id"
              className={`form-control ${editErrors.cliente_id ? 'error' : ''}`}
              value={editForm.cliente_id || ''} onChange={handleEditChange}
            >
              <option value="">Selecione um cliente...</option>
              {clientesOrdenados.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {editErrors.cliente_id && (
              <span className="form-error"><AlertCircle size={12} />{editErrors.cliente_id}</span>
            )}
          </div>

          {/* Tipo de Equipamento — ordem alfabética */}
          <div className="form-group">
            <label htmlFor="edit-os-equipamento" className="form-label">
              <Cpu size={12} style={{ display: 'inline', marginRight: '4px' }} />Tipo de Equipamento *
            </label>
            <select
              id="edit-os-equipamento" name="tipo_equipamento"
              className={`form-control ${editErrors.tipo_equipamento ? 'error' : ''}`}
              value={editForm.tipo_equipamento || ''} onChange={handleEditChange}
            >
              {EQUIPAMENTOS.map(eq => <option key={eq} value={eq}>{eq}</option>)}
            </select>
            {editErrors.tipo_equipamento && (
              <span className="form-error"><AlertCircle size={12} />{editErrors.tipo_equipamento}</span>
            )}
          </div>

          {/* ── Descrição com histórico bloqueado ── */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Descrição / Histórico
            </label>

            {/* Texto original — bloqueado, cinza */}
            <div style={{
              position: 'relative',
              borderRadius: '10px 10px 0 0',
              border: '1px solid var(--color-border)',
              borderBottom: 'none',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <textarea
                id="edit-os-descricao-locked"
                readOnly
                value={editForm.descricao_locked || ''}
                rows={3}
                aria-label="Texto original da OS (somente leitura)"
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '10px 10px 0 0',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  resize: 'none',
                  cursor: 'default',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {/* Ícone de cadeado */}
              <Lock
                size={13}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  color: 'var(--color-text-muted)', opacity: 0.5, pointerEvents: 'none',
                }}
              />
            </div>

            {/* Divisor */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px',
              background: 'rgba(var(--color-accent-rgb, 0,212,255),0.06)',
              borderLeft: '1px solid var(--color-border)',
              borderRight: '1px solid var(--color-border)',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{
                fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em',
                color: 'var(--color-text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>
                Nova Observação
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            {/* Nova observação — editável */}
            <textarea
              id="edit-os-descricao-nova"
              name="descricao_nova"
              rows={3}
              placeholder="Adicione observações ou atualizações sobre o reparo... (opcional)"
              value={editForm.descricao_nova || ''}
              onChange={handleEditChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
              O texto original fica registrado acima. Novas observações são salvas com data e hora automáticas.
            </span>
          </div>

          {/* Valor — obrigatório */}
          <div className="form-group">
            <label htmlFor="edit-os-valor" className="form-label">
              <DollarSign size={12} style={{ display: 'inline', marginRight: '4px' }} />Valor (R$) *
            </label>
            <input
              id="edit-os-valor" name="valor" type="number" step="0.01" min="0"
              className={`form-control ${editErrors.valor ? 'error' : ''}`}
              placeholder="Ex: 150.00"
              value={editForm.valor ?? ''} onChange={handleEditChange}
            />
            {editErrors.valor && (
              <span className="form-error"><AlertCircle size={12} />{editErrors.valor}</span>
            )}
          </div>

          {/* Status do Conserto */}
          <div className="form-group">
            <label htmlFor="edit-os-status" className="form-label">Status do Conserto *</label>
            <select
              id="edit-os-status" name="status"
              className={`form-control ${editErrors.status ? 'error' : ''}`}
              value={editForm.status || ''} onChange={handleEditChange}
            >
              {STATUS_CONSERTO_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {editErrors.status && (
              <span className="form-error"><AlertCircle size={12} />{editErrors.status}</span>
            )}
          </div>

          {/* Status Aprovação */}
          <div className="form-group">
            <label htmlFor="edit-os-aprovacao" className="form-label">Status Aprovação</label>
            <select
              id="edit-os-aprovacao" name="status_aprovacao"
              className="form-control"
              value={editForm.status_aprovacao || 'Aguardando'} onChange={handleEditChange}
            >
              {STATUS_APROVACAO_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Ordens;
