import React, { useState, useCallback } from 'react';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ToastContainer from './components/ui/ToastContainer';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Ordens from './pages/Ordens';
import Usuarios from './pages/Usuarios';
import Login from './pages/Login';
import { useClientes } from './hooks/useClientes';
import { useOrdens } from './hooks/useOrdens';
import { useToast } from './hooks/useToast';

/**
 * Conteúdo principal — só renderizado quando autenticado
 */
function AppContent() {
  const { role, nomeUsuario, ativo, signOut, loading: authLoading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { toasts, toast, removeToast } = useToast();
  const { clientes, loading: clientesLoading, error: clientesError, fetchClientes, criarCliente } = useClientes();
  const { ordens, loading: ordensLoading, error: ordensError, fetchOrdens, criarOrdem, atualizarOrdem, atualizarStatus, atualizarAprovacao } = useOrdens();

  // Permissões por role
  const canManageClientes = role === 'atendente' || role === 'administrador';
  const canCreateOS = role === 'atendente' || role === 'administrador';
  const canEditOS = role === 'tecnico' || role === 'administrador';
  const canChangeConserto = role === 'tecnico' || role === 'administrador';
  const canChangeAprovacao = role === 'atendente' || role === 'administrador';
  const isAdmin = role === 'administrador';

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (activePage === 'clientes') await fetchClientes();
      else if (activePage === 'ordens') await fetchOrdens();
      else await Promise.all([fetchClientes(), fetchOrdens()]);
      toast.info('Dados atualizados!');
    } catch { toast.error('Erro ao atualizar dados.'); }
    finally { setIsRefreshing(false); }
  }, [activePage, fetchClientes, fetchOrdens, toast]);

  const handleCriarCliente = useCallback(async (data) => {
    try { await criarCliente(data); toast.success('Cliente cadastrado com sucesso!'); }
    catch (err) { toast.error(err.message || 'Erro ao cadastrar cliente.'); throw err; }
  }, [criarCliente, toast]);

  const handleCriarOrdem = useCallback(async (data) => {
    try { await criarOrdem(data); toast.success('Ordem de Serviço criada com sucesso!'); }
    catch (err) { toast.error(err.message || 'Erro ao criar OS.'); throw err; }
  }, [criarOrdem, toast]);

  const handleAtualizarOrdem = useCallback(async (id, campos) => {
    try { await atualizarOrdem(id, campos); toast.success('OS atualizada com sucesso!'); }
    catch (err) { toast.error(err.message || 'Erro ao atualizar OS.'); throw err; }
  }, [atualizarOrdem, toast]);

  const handleAtualizarStatus = useCallback(async (id, novoStatus) => {
    try { await atualizarStatus(id, novoStatus); toast.success(`Status atualizado para "${novoStatus}".`); }
    catch (err) { toast.error(err.message || 'Erro ao atualizar status.'); throw err; }
  }, [atualizarStatus, toast]);

  const handleAtualizarAprovacao = useCallback(async (id, novoStatus) => {
    try { await atualizarAprovacao(id, novoStatus); toast.success(`Aprovação atualizada para "${novoStatus}".`); }
    catch (err) { toast.error(err.message || 'Erro ao atualizar aprovação.'); throw err; }
  }, [atualizarAprovacao, toast]);

  // Usuário inativo — bloqueia acesso
  if (!authLoading && ativo === false) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-primary)', flexDirection: 'column', gap: '16px', padding: '20px',
      }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ color: 'var(--color-cancelada)', margin: 0 }}>Acesso desativado</h2>
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          Sua conta foi desativada. Fale com o Administrador.
        </p>
        <button className="btn btn-secondary" onClick={signOut}>Sair</button>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard ordens={ordens} loading={ordensLoading} />;
      case 'clientes':
        return (
          <Clientes
            clientes={clientes} loading={clientesLoading} error={clientesError}
            onCriar={handleCriarCliente} canManage={canManageClientes}
          />
        );
      case 'ordens':
        return (
          <Ordens
            ordens={ordens} clientes={clientes}
            loading={ordensLoading} error={ordensError}
            onCriar={handleCriarOrdem} onAtualizar={handleAtualizarOrdem}
            onAtualizarStatus={handleAtualizarStatus} onAtualizarAprovacao={handleAtualizarAprovacao}
            canCreateOS={canCreateOS} canEditOS={canEditOS}
            canChangeConserto={canChangeConserto} canChangeAprovacao={canChangeAprovacao}
            isAdmin={isAdmin}
          />
        );
      case 'usuarios':
        return isAdmin ? <Usuarios /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdmin={isAdmin}
        nomeUsuario={nomeUsuario}
        role={role}
        onSignOut={signOut}
      />
      <div className="main-content">
        <Header
          activePage={activePage}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          onRefresh={activePage !== 'usuarios' ? handleRefresh : undefined}
          isRefreshing={isRefreshing}
          nomeUsuario={nomeUsuario}
          role={role}
        />
        <main className="page-wrapper" id="main-content" role="main">
          {renderPage()}
        </main>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

/**
 * Componente raiz — gerencia auth gate
 */
function AppGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-primary)', flexDirection: 'column', gap: '16px',
      }}>
        <div className="spinner spinner-lg" />
        <span style={{ color: 'var(--color-text-muted)' }}>Verificando sessão...</span>
      </div>
    );
  }

  return user ? <AppContent /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}

export default App;
