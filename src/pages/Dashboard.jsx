import React, { useMemo } from 'react';
import {
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';

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
 * Card de estatística individual
 */
function StatCard({ icon: Icon, label, value, colorClass, note }) {
  return (
    <div className={`glass-card stat-card ${colorClass}`}>
      <div className={`stat-icon ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {note && <div className="stat-change">{note}</div>}
    </div>
  );
}

/**
 * Dashboard — Painel de controle principal
 */
function Dashboard({ ordens, loading }) {
  const stats = useMemo(() => {
    const total = ordens.length;
    const pendentes = ordens.filter(o => o.status === 'Pendente').length;
    const emAndamento = ordens.filter(o => o.status === 'Em Andamento').length;
    const finalizadas = ordens.filter(o => o.status === 'Finalizada').length;
    const canceladas = ordens.filter(o => o.status === 'Cancelada').length;

    const faturamento = ordens
      .filter(o => o.status === 'Finalizada')
      .reduce((acc, o) => acc + (parseFloat(o.valor) || 0), 0);

    return { total, pendentes, emAndamento, finalizadas, canceladas, faturamento };
  }, [ordens]);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2 className="page-title">Painel de Controle</h2>
            <p className="page-description">Métricas e resumo em tempo real</p>
          </div>
        </div>
        <div className="stats-grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card stat-card">
              <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '10px', marginBottom: '16px' }} />
              <div className="skeleton" style={{ width: '60%', height: '2rem', marginBottom: '8px' }} />
              <div className="skeleton" style={{ width: '80%', height: '0.82rem' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Painel de Controle</h2>
          <p className="page-description">Métricas e resumo em tempo real</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
          <Activity size={14} />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={ClipboardList}
          label="Total de Ordens de Serviço"
          value={stats.total}
          colorClass="accent"
          note={`${stats.total === 1 ? '1 OS registrada' : `${stats.total} OS registradas`}`}
        />
        <StatCard
          icon={Clock}
          label="Pendentes"
          value={stats.pendentes}
          colorClass="amber"
          note="Aguardando atendimento"
        />
        <StatCard
          icon={Wrench}
          label="Em Andamento"
          value={stats.emAndamento}
          colorClass="blue"
          note="Em execução agora"
        />
        <StatCard
          icon={CheckCircle2}
          label="Finalizadas"
          value={stats.finalizadas}
          colorClass="green"
          note="OS concluídas"
        />
        <StatCard
          icon={DollarSign}
          label="Faturamento Total"
          value={formatCurrency(stats.faturamento)}
          colorClass="green"
          note="Soma das OS finalizadas"
        />
      </div>

      {/* Detalhamento por status */}
      <div className="section-title" style={{ marginTop: '8px' }}>Distribuição por Status</div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Pendente', count: stats.pendentes, total: stats.total, color: 'var(--color-pendente)', bg: 'var(--color-pendente-bg)' },
            { label: 'Em Andamento', count: stats.emAndamento, total: stats.total, color: 'var(--color-andamento)', bg: 'var(--color-andamento-bg)' },
            { label: 'Finalizada', count: stats.finalizadas, total: stats.total, color: 'var(--color-finalizada)', bg: 'var(--color-finalizada-bg)' },
            { label: 'Cancelada', count: stats.canceladas, total: stats.total, color: 'var(--color-cancelada)', bg: 'var(--color-cancelada-bg)' },
          ].map(({ label, count, total, color, bg }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    {label}
                  </span>
                  <span style={{ fontSize: '0.875rem', color, fontWeight: 700 }}>
                    {count} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>({pct}%)</span>
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: '4px',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 0 8px ${color}55`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {stats.total === 0 && (
          <div className="empty-state" style={{ padding: '32px 0 0' }}>
            <div className="empty-state-icon">📊</div>
            <p className="empty-state-title">Nenhuma OS registrada ainda</p>
            <p className="empty-state-text">Crie sua primeira ordem de serviço para ver as métricas</p>
          </div>
        )}
      </div>

      {/* Resumo de faturamento destacado */}
      {stats.faturamento > 0 && (
        <div className="glass-card" style={{
          padding: '24px',
          marginTop: '20px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(34, 211, 238, 0.05))',
          borderColor: 'rgba(16, 185, 129, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px',
              background: 'var(--color-finalizada-bg)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-finalizada)',
            }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Receita gerada por OS finalizadas
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-finalizada)', letterSpacing: '-0.03em', marginTop: '2px' }}>
                {formatCurrency(stats.faturamento)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
