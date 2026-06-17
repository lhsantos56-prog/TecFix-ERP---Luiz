import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';

const PAGE_INFO = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Visão geral e métricas do sistema',
  },
  clientes: {
    title: 'Gestão de Clientes',
    subtitle: 'Cadastre e gerencie seus clientes',
  },
  ordens: {
    title: 'Ordens de Serviço',
    subtitle: 'Acompanhe e gerencie as OS em andamento',
  },
};

/**
 * Topbar / Header da aplicação
 */
function Header({ activePage, onMenuToggle, onRefresh, isRefreshing }) {
  const { title, subtitle } = PAGE_INFO[activePage] || PAGE_INFO.dashboard;

  return (
    <header className="header" role="banner">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label="Abrir menu"
          id="mobile-menu-toggle"
        >
          <Menu size={20} />
        </button>
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>

      <div className="header-right">
        <div className="header-badge">
          <span>Sistema Online</span>
        </div>

        {onRefresh && (
          <button
            className="btn btn-secondary btn-icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Atualizar dados"
            title="Atualizar"
            id="refresh-btn"
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin-animation' : ''} />
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
