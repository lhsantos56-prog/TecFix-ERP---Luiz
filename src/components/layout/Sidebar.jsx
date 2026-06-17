import React from 'react';
import {
  LayoutDashboard, Users, ClipboardList, Wrench, X, LogOut, UserCog,
} from 'lucide-react';

const ROLE_LABEL = {
  atendente: 'Atendente',
  tecnico: 'Técnico',
  administrador: 'Administrador',
};

const ROLE_COLOR = {
  atendente: 'var(--color-accent)',
  tecnico: '#818cf8',
  administrador: 'var(--color-pendente)',
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'ordens', label: 'Ordens de Serviço', icon: ClipboardList },
];

/**
 * Sidebar de navegação lateral
 */
function Sidebar({ activePage, onNavigate, isOpen, onClose, isAdmin, nomeUsuario, role, onSignOut }) {
  return (
    <>
      {/* Overlay mobile */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Menu principal">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🛠️</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">TecFix</span>
            <span className="sidebar-logo-subtitle">ERP Sistema</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}
            aria-label="Fechar menu" style={{ marginLeft: 'auto', display: 'none' }} id="sidebar-close-btn">
            <X size={16} />
          </button>
        </div>

        {/* Navegação principal */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Menu Principal</span>

          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`nav-${id}`}
              className={`nav-item ${activePage === id ? 'active' : ''}`}
              onClick={() => { onNavigate(id); onClose(); }}
              aria-current={activePage === id ? 'page' : undefined}
            >
              <Icon className="nav-item-icon" size={18} />
              <span>{label}</span>
            </button>
          ))}

          {/* Usuários — somente administrador */}
          {isAdmin && (
            <>
              <span className="sidebar-section-label" style={{ marginTop: '12px' }}>Administração</span>
              <button
                id="nav-usuarios"
                className={`nav-item ${activePage === 'usuarios' ? 'active' : ''}`}
                onClick={() => { onNavigate('usuarios'); onClose(); }}
                aria-current={activePage === 'usuarios' ? 'page' : undefined}
              >
                <UserCog className="nav-item-icon" size={18} />
                <span>Usuários</span>
              </button>
            </>
          )}
        </nav>

        {/* Footer — usuário logado */}
        <div className="sidebar-footer" style={{ padding: '12px 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
            marginBottom: '10px',
          }}>
            {/* Avatar */}
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${ROLE_COLOR[role] || 'var(--color-accent)'}, #6366f1)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 800, color: '#0a0f1e',
            }}>
              {(nomeUsuario || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.82rem', fontWeight: 600,
                color: 'var(--color-text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {nomeUsuario || 'Usuário'}
              </div>
              <div style={{
                fontSize: '0.68rem', fontWeight: 600,
                color: ROLE_COLOR[role] || 'var(--color-accent)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {ROLE_LABEL[role] || role}
              </div>
            </div>
          </div>

          {/* Botão sair */}
          <button
            id="btn-signout"
            className="btn btn-secondary"
            onClick={onSignOut}
            style={{ width: '100%', fontSize: '0.82rem', padding: '8px' }}
          >
            <LogOut size={14} />
            Sair do sistema
          </button>

          <div style={{ marginTop: '10px', fontSize: '0.68rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            <Wrench size={10} style={{ display: 'inline', marginRight: '4px' }} />
            TecFix v1.1 — Assistência Técnica
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
