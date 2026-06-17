# 🛠️ TecFix ERP — Sistema de Controle de Ordens de Serviço

Mini ERP desenvolvido com **React + Vite + Supabase** para gestão de clientes e ordens de serviço da TecFix Assistência Técnica.

---

## ✨ Funcionalidades

### Obrigatórias
- ✅ **Dashboard** — Cards de resumo: total de OS, por status e faturamento total
- ✅ **Gestão de Clientes** — Listagem em cards + formulário de cadastro com validação completa
- ✅ **Gestão de OS** — Tabela com criação, edição completa e atualização inline de status
- ✅ **Filtro por Status** — Chips de filtro rápido na listagem de OS

### Diferenciais Implementados
- ✅ **Busca por Texto** — Filtra OS por nome do cliente ou descrição em tempo real
- ✅ **Tipo de Equipamento** — Campo de categorização: Celular, Notebook, Televisão, Tablet, Desktop, Console, Áudio/Som, Outro
- ✅ **Status do Conserto** — Pendente / Em Andamento / Finalizada / Cancelada (atualização inline por linha)
- ✅ **Status de Aprovação** — Aguardando / Aprovado / Reprovado (atualização inline independente)
- ✅ **Histórico de Descrição** — Texto original bloqueado (somente leitura); novas observações adicionadas com data/hora automática
- ✅ **Valor Flexível** — Opcional na criação (salva como R$ 0,00); obrigatório ao editar
- ✅ **Ordenação Alfabética** — Clientes e tipos de equipamento ordenados por nome (pt-BR)
- ✅ **Modal de Edição Completa** — Edita todos os campos da OS (cliente, equipamento, descrição, valor, status do conserto e aprovação)
- ✅ **Row Level Security (RLS)** — Políticas de segurança no Supabase (ver `SQL_SETUP.md`)
- ✅ **UI/UX Premium** — Dark mode, glassmorphism, micro-animações, toasts de feedback
- ✅ **Responsividade** — Sidebar colapsável em mobile com menu hamburger

---

## 🚀 Como rodar

### 1. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute o script em [`SQL_SETUP.md`](./SQL_SETUP.md)
3. Copie a **URL** e a **Anon Key** do projeto (Settings → API)

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

---

## 🏗️ Estrutura do Projeto

```
src/
  components/
    layout/
      Sidebar.jsx         — Navegação lateral responsiva
      Header.jsx          — Topbar com título e refresh
    ui/
      Modal.jsx           — Modal genérico acessível
      ToastContainer.jsx  — Notificações toast
  hooks/
    useClientes.js        — CRUD de clientes (Supabase)
    useOrdens.js          — CRUD de ordens de serviço (Supabase)
    useToast.js           — Sistema de notificações
  pages/
    Dashboard.jsx         — Painel com métricas e resumo financeiro
    Clientes.jsx          — Gestão de clientes
    Ordens.jsx            — Gestão de OS (criação, edição, filtros, ações inline)
  supabaseClient.js       — Cliente Supabase configurado
  App.jsx                 — Roteamento, handlers e layout principal
  index.css               — Design system completo (variáveis, tokens, componentes)
```

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Frontend SPA |
| Vite | 6 | Bundler e dev server |
| Supabase | JS SDK v2 | Backend / Banco de dados (PostgreSQL) |
| Vanilla CSS | — | Estilização (Dark Mode, Glassmorphism) |
| lucide-react | latest | Ícones SVG |

---

## 📋 Banco de Dados

### Tabela `clientes`

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único |
| nome | TEXT NOT NULL | Nome completo |
| email | TEXT | E-mail de contato |
| telefone | TEXT | Telefone de contato |
| created_at | TIMESTAMPTZ | Data de criação |

### Tabela `ordens_servico`

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único |
| cliente_id | UUID (FK → clientes) | Cliente responsável |
| descricao | TEXT NOT NULL | Descrição do problema + histórico de observações |
| tipo_equipamento | TEXT NOT NULL | Categoria: Celular, Notebook, Televisão, Tablet, Desktop, Console, Áudio/Som, Outro |
| valor | NUMERIC(10,2) | Valor do serviço (default 0) |
| status | TEXT NOT NULL | Status do conserto: Pendente / Em Andamento / Finalizada / Cancelada |
| status_aprovacao | TEXT NOT NULL | Status de aprovação: Aguardando / Aprovado / Reprovado |
| created_at | TIMESTAMPTZ | Data de abertura da OS |

> **Script SQL completo** disponível em [`SQL_SETUP.md`](./SQL_SETUP.md)

---

## 🎨 Design System

O projeto utiliza um design system próprio em CSS puro (`index.css`) com:

- **Variáveis CSS** para cores, espaçamentos, sombras e transições
- **Dark mode** nativo com paleta escura (`#090e1a` base)
- **Glassmorphism** nos cards e modais (`backdrop-filter: blur`)
- **Badges de status** com cores semânticas e animação de pulso
- **Micro-animações** em hover, foco e transições de página
- **Fonte**: Inter (Google Fonts)

---

## 📝 Regras de Negócio

| Regra | Comportamento |
|---|---|
| Criar OS | Valor é opcional (salva como R$ 0,00); status inicia como **Pendente**; aprovação inicia como **Aguardando** |
| Editar OS | Valor é **obrigatório**; todos os campos são editáveis |
| Descrição | Texto original é bloqueado na edição; novas observações são adicionadas com timestamp automático |
| Tipo de equipamento | Obrigatório na criação e edição |
| Ordenação | Clientes e equipamentos exibidos em ordem alfabética (pt-BR) |
| Status inline | Conserto e Aprovação possuem selects independentes por linha na tabela |
