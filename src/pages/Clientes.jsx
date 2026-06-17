import React, { useState } from 'react';
import { UserPlus, Mail, Phone, User, Search, Loader2, AlertCircle, Users } from 'lucide-react';
import Modal from '../components/ui/Modal';

/**
 * Valida os campos do formulário de cliente
 */
function validateForm(fields) {
  const errors = {};

  if (!fields.nome.trim()) {
    errors.nome = 'Nome é obrigatório.';
  } else if (fields.nome.trim().length < 3) {
    errors.nome = 'Nome deve ter ao menos 3 caracteres.';
  }

  if (!fields.email.trim()) {
    errors.email = 'E-mail é obrigatório.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!fields.telefone.trim()) {
    errors.telefone = 'Telefone é obrigatório.';
  }

  return errors;
}

const INITIAL_FORM = { nome: '', email: '', telefone: '' };

/**
 * Página de Gestão de Clientes
 */
function Clientes({ clientes, loading, error, onCriar, canManage = true }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const filteredClientes = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Limpa erro do campo ao digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      await onCriar({ nome: form.nome.trim(), email: form.email.trim(), telefone: form.telefone.trim() });
      setForm(INITIAL_FORM);
      setFormErrors({});
      setIsModalOpen(false);
    } catch (err) {
      setFormErrors({ general: err.message || 'Erro ao salvar cliente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm(INITIAL_FORM);
    setFormErrors({});
  };

  // Gera iniciais para o avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase())
      .join('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Clientes</h2>
          <p className="page-description">
            {loading ? 'Carregando...' : `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} cadastrado${clientes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canManage && (
          <button id="btn-novo-cliente" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={16} />Novo Cliente
          </button>
        )}
      </div>

      {/* Erro geral */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 18px', borderRadius: '10px', marginBottom: '20px',
          background: 'var(--color-cancelada-bg)',
          border: '1px solid var(--color-cancelada-border)',
          color: 'var(--color-cancelada)', fontSize: '0.875rem',
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Busca */}
      {!loading && clientes.length > 0 && (
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              id="cliente-search"
              className="form-control"
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Buscar clientes"
            />
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <div className="spinner spinner-lg" />
          <span>Carregando clientes...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredClientes.length === 0 && (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={48} strokeWidth={1} />
            </div>
            <p className="empty-state-title">
              {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </p>
            <p className="empty-state-text">
              {search
                ? 'Tente um termo diferente na busca.'
                : 'Clique em "Novo Cliente" para começar.'}
            </p>
          </div>
        </div>
      )}

      {/* Grid de clientes */}
      {!loading && filteredClientes.length > 0 && (
        <div className="clients-grid">
          {filteredClientes.map(cliente => (
            <div key={cliente.id} className="glass-card client-card">
              <div className="client-header">
                <div className="client-avatar">
                  {getInitials(cliente.nome)}
                </div>
                <div className="client-info">
                  <div className="client-name">{cliente.nome}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    desde {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="client-detail">
                  <Mail size={12} />
                  <span className="truncate">{cliente.email}</span>
                </div>
                <div className="client-detail">
                  <Phone size={12} />
                  <span>{cliente.telefone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Novo Cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Novo Cliente"
        subtitle="Preencha os dados do cliente abaixo"
        footer={
          <>
            <button
              id="btn-cancelar-cliente"
              className="btn btn-secondary"
              onClick={handleCloseModal}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              id="btn-salvar-cliente"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spin-animation" />
                  Salvando...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Salvar Cliente
                </>
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate>
          {/* Erro geral do formulário */}
          {formErrors.general && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px', borderRadius: '8px',
              background: 'var(--color-cancelada-bg)',
              border: '1px solid var(--color-cancelada-border)',
              color: 'var(--color-cancelada)', fontSize: '0.82rem',
            }}>
              <AlertCircle size={14} />
              <span>{formErrors.general}</span>
            </div>
          )}

          {/* Nome */}
          <div className="form-group">
            <label htmlFor="cliente-nome" className="form-label">
              <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Nome completo *
            </label>
            <input
              id="cliente-nome"
              name="nome"
              type="text"
              className={`form-control ${formErrors.nome ? 'error' : ''}`}
              placeholder="Ex: João Silva"
              value={form.nome}
              onChange={handleChange}
              autoComplete="name"
              autoFocus
            />
            {formErrors.nome && (
              <span className="form-error">
                <AlertCircle size={12} />
                {formErrors.nome}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="cliente-email" className="form-label">
              <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
              E-mail *
            </label>
            <input
              id="cliente-email"
              name="email"
              type="email"
              className={`form-control ${formErrors.email ? 'error' : ''}`}
              placeholder="Ex: joao@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {formErrors.email && (
              <span className="form-error">
                <AlertCircle size={12} />
                {formErrors.email}
              </span>
            )}
          </div>

          {/* Telefone */}
          <div className="form-group">
            <label htmlFor="cliente-telefone" className="form-label">
              <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Telefone *
            </label>
            <input
              id="cliente-telefone"
              name="telefone"
              type="tel"
              className={`form-control ${formErrors.telefone ? 'error' : ''}`}
              placeholder="Ex: (11) 99999-9999"
              value={form.telefone}
              onChange={handleChange}
              autoComplete="tel"
            />
            {formErrors.telefone && (
              <span className="form-error">
                <AlertCircle size={12} />
                {formErrors.telefone}
              </span>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Clientes;
