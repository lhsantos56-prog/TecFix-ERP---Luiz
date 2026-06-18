import React, { useEffect, useState, useCallback } from 'react';
import {
  UserPlus, Users, AlertCircle, Loader2,
  Mail, Lock, User, ShieldCheck, ToggleLeft, ToggleRight,
  Eye, EyeOff, Pencil, X, Calendar,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useUsuarios } from '../hooks/useUsuarios';
import { formatDate } from '../utils/format';

// ── Constantes ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: 'atendente',     label: 'Atendente' },
  { value: 'tecnico',       label: 'Técnico' },
  { value: 'administrador', label: 'Administrador' },
];

const ROLE_BADGE_STYLE = {
  atendente:     { background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' },
  tecnico:       { background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' },
  administrador: { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
};

const INITIAL_CREATE_FORM = { nome: '', email: '', password: '', confirmPassword: '', role: 'atendente' };
const INITIAL_EDIT_FORM   = { nome: '', password: '', confirmPassword: '', role: 'atendente' };

// ── Helpers de validação ──────────────────────────────────────────────────────

function validateCreateForm(f) {
  const errors = {};
  if (!f.nome.trim() || f.nome.trim().length < 3) errors.nome = 'Nome deve ter ao menos 3 caracteres.';
  if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errors.email = 'Informe um e-mail válido.';
  if (!f.password || f.password.length < 6) errors.password = 'Senha deve ter ao menos 6 caracteres.';
  if (f.password !== f.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';
  if (!f.role) errors.role = 'Selecione um perfil.';
  return errors;
}

function validateEditForm(f) {
  const errors = {};
  if (!f.nome.trim() || f.nome.trim().length < 3) errors.nome = 'Nome deve ter ao menos 3 caracteres.';
  if (!f.role) errors.role = 'Selecione um perfil.';
  if (f.password) {
    if (f.password.length < 6) errors.password = 'Senha deve ter ao menos 6 caracteres.';
    if (f.password !== f.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';
  }
  return errors;
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const style = ROLE_BADGE_STYLE[role] || {};
  const label = ROLE_OPTIONS.find(r => r.value === role)?.label || role;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '0.72rem', fontWeight: 700,
      ...style,
    }}>
      {label}
    </span>
  );
}

function SituacaoBadge({ ativo }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '0.72rem', fontWeight: 700,
      ...(ativo
        ? { background: 'var(--color-finalizada-bg)', color: 'var(--color-finalizada)', border: '1px solid var(--color-finalizada-border)' }
        : { background: 'var(--color-cancelada-bg)',  color: 'var(--color-cancelada)',  border: '1px solid var(--color-cancelada-border)' }
      ),
    }}>
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function AvatarCircle({ nome, role }) {
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
      background: ROLE_BADGE_STYLE[role]?.background || 'var(--color-accent-dim)',
      border: ROLE_BADGE_STYLE[role]?.border || '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.8rem', fontWeight: 800,
      color: ROLE_BADGE_STYLE[role]?.color || 'var(--color-accent)',
    }}>
      {(nome || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function PasswordInput({ id, name, value, onChange, error, placeholder, label }) {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />{label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id} name={name} type={show ? 'text' : 'password'}
          className={`form-control ${error ? 'error' : ''}`}
          placeholder={placeholder} value={value} onChange={onChange}
          style={{ paddingRight: '40px' }}
        />
        <button type="button" onClick={() => setShow(v => !v)} style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-muted)', display: 'flex',
        }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <span className="form-error"><AlertCircle size={12} />{error}</span>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

function Usuarios() {
  const {
    usuarios, loading, error,
    fetchUsuarios, criarUsuario, editarUsuario, toggleAtivo,
  } = useUsuarios();

  // Estado — modal Criar
  const [isCreateOpen,  setIsCreateOpen]  = useState(false);
  const [createForm,    setCreateForm]    = useState(INITIAL_CREATE_FORM);
  const [createErrors,  setCreateErrors]  = useState({});
  const [creating,      setCreating]      = useState(false);

  // Estado — modal Visualizar
  const [viewingUser, setViewingUser] = useState(null);

  // Estado — modal Editar
  const [editingUser,  setEditingUser]  = useState(null);
  const [editForm,     setEditForm]     = useState(INITIAL_EDIT_FORM);
  const [editErrors,   setEditErrors]   = useState({});
  const [saving,       setSaving]       = useState(false);

  // Estado — toggle ativo
  const [savingToggleId, setSavingToggleId] = useState(null);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  // ── Handlers — modal Criar ──────────────────────────────────────────────────

  const handleCreateChange = useCallback((e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
    setCreateErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCreateForm(createForm);
    if (Object.keys(errors).length > 0) { setCreateErrors(errors); return; }
    setCreating(true);
    try {
      await criarUsuario({
        email: createForm.email.trim(),
        password: createForm.password,
        nome: createForm.nome.trim(),
        role: createForm.role,
      });
      setCreateForm(INITIAL_CREATE_FORM);
      setCreateErrors({});
      setIsCreateOpen(false);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setCreateErrors({ email: 'Este e-mail já está cadastrado.' });
      } else {
        setCreateErrors({ general: msg || 'Erro ao criar usuário.' });
      }
    } finally {
      setCreating(false);
    }
  };

  // ── Handlers — modal Editar ─────────────────────────────────────────────────

  const openEdit = useCallback((usuario) => {
    setEditingUser(usuario);
    setEditForm({ nome: usuario.nome || '', password: '', confirmPassword: '', role: usuario.role });
    setEditErrors({});
  }, []);

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    setEditErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateEditForm(editForm);
    if (Object.keys(errors).length > 0) { setEditErrors(errors); return; }
    setSaving(true);
    try {
      await editarUsuario(editingUser.id, {
        nome: editForm.nome.trim(),
        role: editForm.role,
        password: editForm.password || null,
      });
      setEditingUser(null);
    } catch (err) {
      setEditErrors({ general: err.message || 'Erro ao salvar alterações.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Handler — toggle ativo ──────────────────────────────────────────────────

  const handleToggleAtivo = async (usuario) => {
    setSavingToggleId(usuario.id);
    try { await toggleAtivo(usuario.id, !usuario.ativo); }
    catch { /* toast gerenciado no App */ }
    finally { setSavingToggleId(null); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Usuários</h2>
          <p className="page-description">
            {loading
              ? 'Carregando...'
              : `${usuarios.length} usuário${usuarios.length !== 1 ? 's' : ''} cadastrado${usuarios.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button id="btn-novo-usuario" className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <UserPlus size={16} />Novo Usuário
        </button>
      </div>

      {/* Erro geral */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px',
          borderRadius: '10px', marginBottom: '20px',
          background: 'var(--color-cancelada-bg)', border: '1px solid var(--color-cancelada-border)',
          color: 'var(--color-cancelada)', fontSize: '0.875rem',
        }}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner spinner-lg" />
          <span>Carregando usuários...</span>
        </div>
      )}

      {/* Vazio */}
      {!loading && usuarios.length === 0 && (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={48} strokeWidth={1} /></div>
            <p className="empty-state-title">Nenhum usuário cadastrado</p>
            <p className="empty-state-text">Clique em "Novo Usuário" para criar o primeiro.</p>
          </div>
        </div>
      )}

      {/* Tabela */}
      {!loading && usuarios.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table" aria-label="Lista de usuários">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Situação</th>
                <th>Desde</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ opacity: u.ativo ? 1 : 0.55 }}>

                  {/* Nome + Avatar */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AvatarCircle nome={u.nome} role={u.role} />
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.nome || '—'}</div>
                    </div>
                  </td>

                  {/* Perfil — badge estático (sem select inline) */}
                  <td><RoleBadge role={u.role} /></td>

                  {/* Situação */}
                  <td><SituacaoBadge ativo={u.ativo} /></td>

                  {/* Data */}
                  <td>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {formatDate(u.created_at, { short: true })}
                    </span>
                  </td>

                  {/* Ações */}
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>

                      {/* Visualizar */}
                      <button
                        id={`btn-ver-usuario-${u.id}`}
                        className="btn btn-sm btn-secondary"
                        onClick={() => setViewingUser(u)}
                        title="Visualizar usuário"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Eye size={13} />Visualizar
                      </button>

                      {/* Editar */}
                      <button
                        id={`btn-editar-usuario-${u.id}`}
                        className="btn btn-sm btn-secondary"
                        onClick={() => openEdit(u)}
                        title="Editar usuário"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Pencil size={13} />Editar
                      </button>

                      {/* Ativar / Desativar */}
                      <button
                        id={`btn-toggle-ativo-${u.id}`}
                        className={`btn btn-sm ${u.ativo ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => handleToggleAtivo(u)}
                        disabled={savingToggleId !== null}
                        title={u.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        {savingToggleId === u.id
                          ? <Loader2 size={13} className="spin-animation" />
                          : u.ativo
                            ? <><ToggleRight size={14} />Desativar</>
                            : <><ToggleLeft  size={14} />Ativar</>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal — Novo Usuário ────────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setCreateForm(INITIAL_CREATE_FORM); setCreateErrors({}); }}
        title="Novo Usuário"
        subtitle="Crie um acesso para um membro da equipe"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => { setIsCreateOpen(false); setCreateForm(INITIAL_CREATE_FORM); setCreateErrors({}); }}
              disabled={creating}
            >
              Cancelar
            </button>
            <button id="btn-salvar-usuario" className="btn btn-primary" onClick={handleCreateSubmit} disabled={creating}>
              {creating ? <><Loader2 size={16} className="spin-animation" />Criando...</> : <><UserPlus size={16} />Criar Usuário</>}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} noValidate>
          {createErrors.general && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px',
              borderRadius: '8px', background: 'var(--color-cancelada-bg)',
              border: '1px solid var(--color-cancelada-border)',
              color: 'var(--color-cancelada)', fontSize: '0.82rem', marginBottom: '8px',
            }}>
              <AlertCircle size={14} /><span>{createErrors.general}</span>
            </div>
          )}

          {/* Nome */}
          <div className="form-group">
            <label htmlFor="c-nome" className="form-label">
              <User size={12} style={{ display: 'inline', marginRight: '4px' }} />Nome completo *
            </label>
            <input id="c-nome" name="nome" type="text"
              className={`form-control ${createErrors.nome ? 'error' : ''}`}
              placeholder="Ex: Maria Silva" value={createForm.nome}
              onChange={handleCreateChange} autoFocus />
            {createErrors.nome && <span className="form-error"><AlertCircle size={12} />{createErrors.nome}</span>}
          </div>

          {/* E-mail */}
          <div className="form-group">
            <label htmlFor="c-email" className="form-label">
              <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />E-mail *
            </label>
            <input id="c-email" name="email" type="email"
              className={`form-control ${createErrors.email ? 'error' : ''}`}
              placeholder="usuario@tecfix.com" value={createForm.email}
              onChange={handleCreateChange} />
            {createErrors.email && <span className="form-error"><AlertCircle size={12} />{createErrors.email}</span>}
          </div>

          {/* Senha */}
          <PasswordInput
            id="c-password" name="password"
            value={createForm.password} onChange={handleCreateChange}
            error={createErrors.password}
            placeholder="Mín. 6 caracteres"
            label="Senha temporária *"
          />

          {/* Confirmar senha */}
          <PasswordInput
            id="c-confirm" name="confirmPassword"
            value={createForm.confirmPassword} onChange={handleCreateChange}
            error={createErrors.confirmPassword}
            placeholder="Repita a senha"
            label="Confirmar senha *"
          />

          {/* Perfil */}
          <div className="form-group">
            <label htmlFor="c-role" className="form-label">
              <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />Perfil de acesso *
            </label>
            <select id="c-role" name="role"
              className={`form-control ${createErrors.role ? 'error' : ''}`}
              value={createForm.role} onChange={handleCreateChange}>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {createErrors.role && <span className="form-error"><AlertCircle size={12} />{createErrors.role}</span>}
          </div>

          {/* Info */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 14px',
            borderRadius: '8px', background: 'var(--color-pendente-bg)',
            border: '1px solid var(--color-pendente-border)',
            fontSize: '0.78rem', color: 'var(--color-pendente)',
          }}>
            <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>O usuário é criado já confirmado — o acesso é imediato, sem necessidade de confirmar e-mail.</span>
          </div>
        </form>
      </Modal>

      {/* ── Modal — Visualizar Usuário ──────────────────────────────────────── */}
      <Modal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="Detalhes do Usuário"
        subtitle="Informações do cadastro"
        footer={
          <button className="btn btn-secondary" onClick={() => setViewingUser(null)}>
            <X size={14} />Fechar
          </button>
        }
      >
        {viewingUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Avatar + nome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: ROLE_BADGE_STYLE[viewingUser.role]?.background || 'var(--color-accent-dim)',
                border: ROLE_BADGE_STYLE[viewingUser.role]?.border || '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', fontWeight: 800,
                color: ROLE_BADGE_STYLE[viewingUser.role]?.color || 'var(--color-accent)',
              }}>
                {(viewingUser.nome || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                  {viewingUser.nome || '—'}
                </div>
              </div>
            </div>

            {/* Campos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Perfil de Acesso
                </div>
                <RoleBadge role={viewingUser.role} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Situação
                </div>
                <SituacaoBadge ativo={viewingUser.ativo} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  <Calendar size={11} style={{ display: 'inline', marginRight: '3px' }} />Cadastrado em
                </div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  {formatDate(viewingUser.created_at)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Atualizado em
                </div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  {formatDate(viewingUser.updated_at)}
                </div>
              </div>
              {/* E-mail — largura total */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  <Mail size={11} style={{ display: 'inline', marginRight: '3px' }} />E-mail
                </div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem', wordBreak: 'break-all' }}>
                  {viewingUser.email || (
                    <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Não disponível</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal — Editar Usuário ──────────────────────────────────────────── */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => { setEditingUser(null); setEditErrors({}); }}
        title="Editar Usuário"
        subtitle={editingUser ? `Editando: ${editingUser.nome}` : ''}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => { setEditingUser(null); setEditErrors({}); }}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              id="btn-salvar-edicao-usuario"
              className="btn btn-primary"
              onClick={handleEditSubmit}
              disabled={saving}
            >
              {saving ? <><Loader2 size={16} className="spin-animation" />Salvando...</> : <><Pencil size={16} />Salvar Alterações</>}
            </button>
          </>
        }
      >
        {editingUser && (
          <form onSubmit={handleEditSubmit} noValidate>
            {editErrors.general && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px',
                borderRadius: '8px', background: 'var(--color-cancelada-bg)',
                border: '1px solid var(--color-cancelada-border)',
                color: 'var(--color-cancelada)', fontSize: '0.82rem', marginBottom: '8px',
              }}>
                <AlertCircle size={14} /><span>{editErrors.general}</span>
              </div>
            )}

            {/* Nome */}
            <div className="form-group">
              <label htmlFor="e-nome" className="form-label">
                <User size={12} style={{ display: 'inline', marginRight: '4px' }} />Nome completo *
              </label>
              <input id="e-nome" name="nome" type="text"
                className={`form-control ${editErrors.nome ? 'error' : ''}`}
                placeholder="Ex: Maria Silva" value={editForm.nome}
                onChange={handleEditChange} autoFocus />
              {editErrors.nome && <span className="form-error"><AlertCircle size={12} />{editErrors.nome}</span>}
            </div>

            {/* E-mail (somente leitura) */}
            <div className="form-group">
              <label htmlFor="e-email" className="form-label">
                <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />E-mail
              </label>
              <input id="e-email" type="email"
                className="form-control"
                value={editingUser.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                O e-mail não pode ser alterado por aqui.
              </span>
            </div>

            {/* Nova senha (opcional) */}
            <PasswordInput
              id="e-password" name="password"
              value={editForm.password} onChange={handleEditChange}
              error={editErrors.password}
              placeholder="Deixe em branco para manter a atual"
              label="Nova senha (opcional)"
            />

            {/* Confirmar nova senha */}
            <PasswordInput
              id="e-confirm" name="confirmPassword"
              value={editForm.confirmPassword} onChange={handleEditChange}
              error={editErrors.confirmPassword}
              placeholder="Repita a nova senha"
              label="Confirmar nova senha"
            />

            {/* Perfil de acesso */}
            <div className="form-group">
              <label htmlFor="e-role" className="form-label">
                <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />Perfil de acesso *
              </label>
              <select id="e-role" name="role"
                className={`form-control ${editErrors.role ? 'error' : ''}`}
                value={editForm.role} onChange={handleEditChange}>
                {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {editErrors.role && <span className="form-error"><AlertCircle size={12} />{editErrors.role}</span>}
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Usuarios;
