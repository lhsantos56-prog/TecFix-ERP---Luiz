# 🛠️ TecFix ERP — Sistema de Controle de Ordens de Serviço

Mini ERP desenvolvido com **React + Vite + Supabase** para a gestão de clientes e ordens de serviço da TecFix.

## ✨ Funcionalidades

### Obrigatórias
- ✅ **Dashboard** — Cards de resumo: total de OS, por status e faturamento total
- ✅ **Gestão de Clientes** — Listagem em cards + formulário de cadastro com validação
- ✅ **Gestão de OS** — Tabela com status colorido, criação e atualização inline de status
- ✅ **Filtro por Status** — Chips de filtro rápido na listagem de OS

### Diferenciais Implementados
- ✅ **Busca por Texto** — Filtra OS por nome do cliente ou descrição
- ✅ **Row Level Security** — Políticas de segurança no Supabase (ver `SQL_SETUP.md`)
- ✅ **UI/UX Premium** — Dark mode, glassmorphism, micro-animações e toasts
- ✅ **Responsividade** — Sidebar colapsável em mobile com menu hamburger

## 🚀 Como rodar

### 1. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute o script em [`SQL_SETUP.md`](./SQL_SETUP.md)
3. Copie a **URL** e a **Anon Key** do projeto (Settings > API)

### 2. Configure o ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas credenciais
```

Conteúdo do `.env`:
```
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 3. Instale e rode

```bash
npm install
npm run dev
```

Acesse em: **http://localhost:5173**

## 🏗️ Estrutura do Projeto

```
src/
  components/
    layout/
      Sidebar.jsx       — Navegação lateral responsiva
      Header.jsx        — Topbar com título e refresh
    ui/
      Modal.jsx         — Modal genérico acessível
      ToastContainer.jsx — Notificações toast
  hooks/
    useClientes.js      — CRUD de clientes (Supabase)
    useOrdens.js        — CRUD de ordens de serviço (Supabase)
    useToast.js         — Sistema de notificações
  pages/
    Dashboard.jsx       — Painel com métricas
    Clientes.jsx        — Gestão de clientes
    Ordens.jsx          — Gestão de OS
  supabaseClient.js     — Cliente Supabase configurado
  App.jsx               — Roteamento e layout principal
  index.css             — Design system completo
```

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 + Vite | Frontend SPA |
| Supabase (PostgreSQL) | Backend / Banco de dados |
| Vanilla CSS | Estilização (Dark Mode, Glassmorphism) |
| lucide-react | Ícones |

## 📋 Banco de Dados

### Tabela `clientes`
| Campo | Tipo |
|---|---|
| id | UUID (PK) |
| nome | TEXT |
| email | TEXT |
| telefone | TEXT |
| created_at | TIMESTAMPTZ |

### Tabela `ordens_servico`
| Campo | Tipo |
|---|---|
| id | UUID (PK) |
| cliente_id | UUID (FK → clientes) |
| descricao | TEXT |
| valor | NUMERIC(10,2) |
| status | TEXT (Pendente/Em Andamento/Finalizada/Cancelada) |
| created_at | TIMESTAMPTZ |
