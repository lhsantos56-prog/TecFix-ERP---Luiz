import React, { useEffect, useState } from 'react';
import {
  UserPlus, Users, AlertCircle, Loader2,
  Mail, Lock, User, ShieldCheck, ToggleLeft, ToggleRight, Eye, EyeOff,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useUsuarios } from '../hooks/useUsuarios';

const ROLE_OPTIONS = [
  { value: 'atendente', label: 'Atendente' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'administrador', label: 'Administrador' },
];

const ROLE_BADGE_STYLE = {
  atendente: { background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' },
  tecnico: { background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' },
  administrador: { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
};

const INITIAL_FORM = { nome: '', email: '', password: '', confirmPassword: '', role: 'atendente' };

function validateForm(f) {
  const errors = {};
  if (!f.nome.trim() || f.nome.trim().length < 3) errors.nome = 'Nome deve ter ao menos 3 caracteres.';
  if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errors.email = 'Informe um e-mail válido.';
  if (!f.password || f.password.length < 6) errors.password = 'Senha deve ter ao menos 6 caracteres.';
  if (f.password !== f.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';
  if (!f.role) errors.role = 'Selecione um perfil.';
  return errors;
}

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

/**
 * Página de Gestão de Usuários — somente Administrador
 */
function Usuarios() {
  const { usuarios, loading, error, fetchUsuarios, criarUsuario, atualizarPerfil, toggleAtivo } = useUsuarios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setSaving(true);
    try {
      await criarUsuario({
        email: form.email.trim(),
        password: form.password,
        nome: form.nome.trim(),
        role: form.role,
      });
      setForm(INITIAL_FORM);
      setFormErrors({});
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setFormErrors({ email: 'Este e-mail já está cadastrado.' });
      } else {
        setFormErrors({ general: msg || 'Erro ao criar usuário.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAtivo = async (usuario) => {
    setSavingId(usuario.id);
    try { await toggleAtivo(usuario.id, !usuario.ativo); }
    catch { /* toast no App */ }
    finally { setSavingId(null); }
  };

  const handleChangeRole = async (usuario, novoRole) => {
    setSavingId(usuario.id);
    try { await atualizarPerfil(usuario.id, { role: novoRole }); }
    catch { /* toast no App */ }
    finally { setSavingId(null); }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Usuários</h2>
          <p className="page-description">
            {loading ? 'Carregando...' : `${usuarios.length} usuário${usuarios.length !== 1 ? 's' : ''} cadastrado${usuarios.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button id="btn-novo-usuario" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} />Novo Usuário
        </button>
      </div>

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

      {loading && (
        <div className="loading-state">
          <div className="spinner spinner-lg" />
          <span>Carregando usuários...</span>
        </div>
      )}

      {!loading && usuarios.length === 0 && (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={48} strokeWidth={1} /></div>
            <p className="empty-state-title">Nenhum usuário cadastrado</p>
            <p className="empty-state-text">Clique em "Novo Usuário" para criar o primeiro.</p>
          </div>
        </div>
      )}

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
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        background: ROLE_BADGE_STYLE[u.role]?.background || 'var(--color-accent-dim)',
                        border: ROLE_BADGE_STYLE[u.role]?.border || '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 800,
                        color: ROLE_BADGE_STYLE[u.role]?.color || 'var(--color-accent)',
                      }}>
                        {(u.nome || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.nome || '—'}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    {savingId === u.id ? (
                      <Loader2 size={14} className="spin-animation" style={{ color: 'var(--color-accent)' }} />
                    ) : (
                      <select
                        id={`role-select-${u.id}`}
                        className="status-select"
                        value={u.role}
                        onChange={e => handleChangeRole(u, e.target.value)}
                        aria-label={`Perfil de ${u.nome}`}
                        disabled={savingId !== null}
                      >
                        {ROLE_OPTIONS.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    )}
                  </td>

                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '3px 10px', borderRadius: '999px',
                      fontSize: '0.72rem', fontWeight: 700,
                      ...(u.ativo
                        ? { background: 'var(--color-finalizada-bg)', color: 'var(--color-finalizada)', border: '1px solid var(--color-finalizada-border)' }
                        : { background: 'var(--color-cancelada-bg)', color: 'var(--color-cancelada)', border: '1px solid var(--color-cancelada-border)' }
                      ),
                    }}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  <td>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {new Date(u.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>
                  </td>

                  <td>
                    <button
                      id={`btn-toggle-ativo-${u.id}`}
                      className={`btn btn-sm ${u.ativo ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => handleToggleAtivo(u)}
                      disabled={savingId !== null}
                      title={u.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {savingId === u.id ? (
                        <Loader2 size={13} className="spin-animation" />
                      ) : u.ativo ? (
                        <><ToggleRight size={14} />Desativar</>
                      ) : (
                        <><ToggleLeft size={14} />Ativar</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal — Novo Usuário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setForm(INITIAL_FORM); setFormErrors({}); }}
        title="Novo Usuário"
        subtitle="Crie um acesso para um membro da equipe"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setForm(INITIAL_FORM); setFormErrors({}); }} disabled={saving}>
              Cancelar
            </button>
            <button id="btn-salvar-usuario" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <><Loader2 size={16} className="spin-animation" />Criando...</> : <><UserPlus size={16} />Criar Usuário</>}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate>
          {formErrors.general && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px',
              borderRadius: '8px', background: 'var(--color-cancelada-bg)',
              border: '1px solid var(--color-cancelada-border)',
              color: 'var(--color-cancelada)', fontSize: '0.82rem',
            }}>
              <AlertCircle size={14} /><span>{formErrors.general}</span>
            </div>
          )}

          {/* Nome */}
          <div className="form-group">
            <label htmlFor="u-nome" className="form-label">
              <User size={12} style={{ display: 'inline', marginRight: '4px' }} />Nome completo *
            </label>
            <input id="u-nome" name="nome" type="text" className={`form-control ${formErrors.nome ? 'error' : ''}`}
              placeholder="Ex: Maria Silva" value={form.nome} onChange={handleChange} autoFocus />
            {formErrors.nome && <span className="form-error"><AlertCircle size={12} />{formErrors.nome}</span>}
          </div>

          {/* E-mail */}
          <div className="form-group">
            <label htmlFor="u-email" className="form-label">
              <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />E-mail *
            </label>
            <input id="u-email" name="email" type="email" className={`form-control ${formErrors.email ? 'error' : ''}`}
              placeholder="usuario@tecfix.com" value={form.email} onChange={handleChange} />
            {formErrors.email && <span className="form-error"><AlertCircle size={12} />{formErrors.email}</span>}
          </div>

          {/* Senha */}
          <div className="form-group">
            <label htmlFor="u-password" className="form-label">
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />Senha temporária *
            </label>
            <div style={{ position: 'relative' }}>
              <input id="u-password" name="password" type={showPass ? 'text' : 'password'}
                className={`form-control ${formErrors.password ? 'error' : ''}`}
                placeholder="Mín. 6 caracteres" value={form.password} onChange={handleChange}
                style={{ paddingRight: '40px' }} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {formErrors.password && <span className="form-error"><AlertCircle size={12} />{formErrors.password}</span>}
          </div>

          {/* Confirmar senha */}
          <div className="form-group">
            <label htmlFor="u-confirm" className="form-label">
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />Confirmar senha *
            </label>
            <div style={{ position: 'relative' }}>
              <input id="u-confirm" name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                className={`form-control ${formErrors.confirmPassword ? 'error' : ''}`}
                placeholder="Repita a senha" value={form.confirmPassword} onChange={handleChange}
                style={{ paddingRight: '40px' }} />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {formErrors.confirmPassword && <span className="form-error"><AlertCircle size={12} />{formErrors.confirmPassword}</span>}
          </div>

          {/* Perfil */}
          <div className="form-group">
            <label htmlFor="u-role" className="form-label">
              <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />Perfil de acesso *
            </label>
            <select id="u-role" name="role" className={`form-control ${formErrors.role ? 'error' : ''}`}
              value={form.role} onChange={handleChange}>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {formErrors.role && <span className="form-error"><AlertCircle size={12} />{formErrors.role}</span>}
          </div>

          {/* Info confirmação de e-mail */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 14px',
            borderRadius: '8px', background: 'var(--color-pendente-bg)',
            border: '1px solid var(--color-pendente-border)',
            fontSize: '0.78rem', color: 'var(--color-pendente)',
          }}>
            <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>O usuário receberá um e-mail de confirmação do Supabase. Se a confirmação estiver desabilitada nas configurações, o acesso é imediato.</span>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Usuarios;
