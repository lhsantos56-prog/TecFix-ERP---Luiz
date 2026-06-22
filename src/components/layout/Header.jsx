import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';

const PAGE_INFO = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral e métricas do sistema' },
  clientes: { title: 'Gestão de Clientes', subtitle: 'Cadastre e gerencie seus clientes' },
  ordens: { title: 'Ordens de Serviço', subtitle: 'Acompanhe e gerencie as OS em andamento' },
  usuarios: { title: 'Usuários', subtitle: 'Gerencie os acessos ao sistema' },
  caixa: { title: 'Caixa', subtitle: 'Gestão de Contas a Receber' },
};

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

/**
 * Topbar / Header da aplicação
 */
function Header({ activePage, onMenuToggle, onRefresh, isRefreshing, nomeUsuario, role }) {
  const { title, subtitle } = PAGE_INFO[activePage] || PAGE_INFO.dashboard;

  return (
    <header className="header" role="banner">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Abrir menu" id="mobile-menu-toggle">
          <Menu size={20} />
        </button>
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>

      <div className="header-right">
        {/* Badge de papel */}
        {role && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '999px',
            background: 'var(--color-bg-card)',
            border: `1px solid ${ROLE_COLOR[role] || 'var(--color-border)'}33`,
            fontSize: '0.72rem', fontWeight: 700,
            color: ROLE_COLOR[role] || 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: ROLE_COLOR[role] || 'var(--color-accent)',
              flexShrink: 0,
            }} />
            {nomeUsuario && <span style={{ color: 'var(--color-text-primary)', textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>{nomeUsuario}</span>}
            <span>·</span>
            {ROLE_LABEL[role] || role}
          </div>
        )}

        {!role && (
          <div className="header-badge">
            <span>Sistema Online</span>
          </div>
        )}

        {onRefresh && (
          <button className="btn btn-secondary btn-icon" onClick={onRefresh}
            disabled={isRefreshing} aria-label="Atualizar dados" title="Atualizar" id="refresh-btn">
            <RefreshCw size={16} className={isRefreshing ? 'spin-animation' : ''} />
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
