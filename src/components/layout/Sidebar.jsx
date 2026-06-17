import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  Wrench,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral do sistema',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: Users,
    description: 'Gestão de clientes',
  },
  {
    id: 'ordens',
    label: 'Ordens de Serviço',
    icon: ClipboardList,
    description: 'Controle de OS',
  },
];

/**
 * Sidebar de navegação lateral
 */
function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  return (
    <>
      {/* Overlay para mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Menu principal">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🛠️</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">TecFix</span>
            <span className="sidebar-logo-subtitle">ERP Sistema</span>
          </div>
          {/* Botão fechar no mobile */}
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Fechar menu"
            style={{ marginLeft: 'auto', display: 'none' }}
            id="sidebar-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Menu Principal</span>

          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`nav-${id}`}
              className={`nav-item ${activePage === id ? 'active' : ''}`}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
              aria-current={activePage === id ? 'page' : undefined}
            >
              <Icon className="nav-item-icon" size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Wrench size={12} />
            <span>TecFix v1.0</span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.7rem' }}>Assistência Técnica Eletrônica</div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
