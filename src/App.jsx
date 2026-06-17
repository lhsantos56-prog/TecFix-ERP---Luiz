import React, { useState, useCallback } from 'react';
import './App.css';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ToastContainer from './components/ui/ToastContainer';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Ordens from './pages/Ordens';
import { useClientes } from './hooks/useClientes';
import { useOrdens } from './hooks/useOrdens';
import { useToast } from './hooks/useToast';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { toasts, toast, removeToast } = useToast();
  const {
    clientes,
    loading: clientesLoading,
    error: clientesError,
    fetchClientes,
    criarCliente,
  } = useClientes();

  const {
    ordens,
    loading: ordensLoading,
    error: ordensError,
    fetchOrdens,
    criarOrdem,
    atualizarOrdem,
    atualizarStatus,
    atualizarAprovacao,
  } = useOrdens();

  // Refresh de dados da página atual
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (activePage === 'clientes') await fetchClientes();
      else if (activePage === 'ordens') await fetchOrdens();
      else {
        await Promise.all([fetchClientes(), fetchOrdens()]);
      }
      toast.info('Dados atualizados!');
    } catch {
      toast.error('Erro ao atualizar dados.');
    } finally {
      setIsRefreshing(false);
    }
  }, [activePage, fetchClientes, fetchOrdens, toast]);

  // Criar cliente com feedback
  const handleCriarCliente = useCallback(async (data) => {
    try {
      await criarCliente(data);
      toast.success('Cliente cadastrado com sucesso!');
    } catch (err) {
      toast.error(err.message || 'Erro ao cadastrar cliente.');
      throw err;
    }
  }, [criarCliente, toast]);

  // Criar OS com feedback
  const handleCriarOrdem = useCallback(async (data) => {
    try {
      await criarOrdem(data);
      toast.success('Ordem de Serviço criada com sucesso!');
    } catch (err) {
      toast.error(err.message || 'Erro ao criar OS.');
      throw err;
    }
  }, [criarOrdem, toast]);

  // Atualizar OS completa com feedback
  const handleAtualizarOrdem = useCallback(async (id, campos) => {
    try {
      await atualizarOrdem(id, campos);
      toast.success('Ordem de Serviço atualizada com sucesso!');
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar OS.');
      throw err;
    }
  }, [atualizarOrdem, toast]);

  // Atualizar status com feedback
  const handleAtualizarStatus = useCallback(async (id, novoStatus) => {
    try {
      await atualizarStatus(id, novoStatus);
      toast.success(`Status atualizado para "${novoStatus}".`);
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar status.');
      throw err;
    }
  }, [atualizarStatus, toast]);

  // Atualizar status de aprovação com feedback
  const handleAtualizarAprovacao = useCallback(async (id, novoStatus) => {
    try {
      await atualizarAprovacao(id, novoStatus);
      toast.success(`Aprovação atualizada para "${novoStatus}".`);
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar aprovação.');
      throw err;
    }
  }, [atualizarAprovacao, toast]);

  // Renderiza a página ativa
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            ordens={ordens}
            loading={ordensLoading}
          />
        );
      case 'clientes':
        return (
          <Clientes
            clientes={clientes}
            loading={clientesLoading}
            error={clientesError}
            onCriar={handleCriarCliente}
          />
        );
      case 'ordens':
        return (
          <Ordens
            ordens={ordens}
            clientes={clientes}
            loading={ordensLoading}
            error={ordensError}
            onCriar={handleCriarOrdem}
            onAtualizar={handleAtualizarOrdem}
            onAtualizarStatus={handleAtualizarStatus}
            onAtualizarAprovacao={handleAtualizarAprovacao}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Conteúdo principal */}
      <div className="main-content">
        <Header
          activePage={activePage}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="page-wrapper" id="main-content" role="main">
          {renderPage()}
        </main>
      </div>

      {/* Notificações Toast */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
