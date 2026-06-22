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
- ✅ **Autenticação Completa** — Login com e-mail/senha via Supabase Auth; sessão persistida em `localStorage`
- ✅ **Controle de Acesso por Perfil (RBAC)** — 3 tipos de usuário com permissões distintas e bloqueios por estado da OS
- ✅ **Gestão de Usuários** — Administradores podem criar, visualizar, editar e ativar/desativar usuários pelo ERP
- ✅ **Busca por Texto** — Filtra OS por nome do cliente ou descrição em tempo real
- ✅ **Tipo de Equipamento** — Campo de categorização: Celular, Notebook, Televisão, Tablet, Desktop, Console, Áudio/Som, Outro
- ✅ **Status do Conserto** — Pendente / Em Andamento / Finalizado / Cancelado (atualização inline por linha)
- ✅ **Status de Aprovação** — Aguardando / Aprovado / Reprovado (atualização inline independente)
- ✅ **Técnico Responsável** — Campo na edição da OS que lista todos os técnicos ativos; bloqueado para Atendente/Técnico após atribuído; apenas Administrador pode alterar
- ✅ **Bloqueio por Estado Terminal** — Conserto e botão Editar bloqueados para Atendente/Técnico quando OS está encerrada
- ✅ **Auto-Cancelamento** — Ao marcar Aprovação como `Reprovado`, o status do conserto é automaticamente alterado para `Cancelado`
- ✅ **Histórico de Descrição** — Texto original bloqueado (somente leitura); novas observações adicionadas com **nome do usuário + data e hora** automáticos
- ✅ **Numeração Sequencial de OS** — Cada OS exibe um número estável no formato `OS-001`, `OS-002`... por ordem de chegada
- ✅ **Ordenação por Chegada** — Ordens exibidas da mais antiga para a mais recente (ordem cronológica)
- ✅ **Exportação em PDF** — Botão "Exportar" em cada OS gera um documento PDF com dados completos do cliente, descrição e valor
- ✅ **Valor Flexível** — Opcional na criação (salva como R$ 0,00); obrigatório ao editar
- ✅ **Ordenação Alfabética** — Clientes e tipos de equipamento ordenados por nome (pt-BR)
- ✅ **Row Level Security (RLS)** — Políticas de segurança no Supabase com função `SECURITY DEFINER` para evitar recursão
- ✅ **UI/UX Premium** — Dark mode, glassmorphism, micro-animações, toasts de feedback
- **Módulo Financeiro (Caixa)** — Página exclusiva para gestão de Contas a Receber (OS aprovadas e finalizadas), com filtros de pagamento (Pendente/Pago) e registro da forma de pagamento (Dinheiro, PIX, Crédito, Débito).
- ✅ **Responsividade** — Sidebar colapsável em mobile com menu hamburger

---

## 🔐 Perfis de Acesso (RBAC)

| Permissão | Atendente | Técnico | Administrador |
|---|:---:|:---:|:---:|
| Visualizar Dashboard | ✅ | ✅ | ✅ |
| Visualizar Faturamento / Receita (Dashboard) | ❌ | ❌ | ✅ |
| Visualizar Clientes | ✅ | ✅ | ✅ |
| Criar Clientes | ✅ | ❌ | ✅ |
| Visualizar OS | ✅ | ✅ | ✅ |
| Criar OS | ✅ | ❌ | ✅ |
| Editar OS (modal completo) | ❌* | ✅* | ✅ |
| Alterar Status do Conserto | ❌ | ✅* | ✅ |
| Alterar Status de Aprovação | ✅* | ✅* | ✅ |
| Exportar OS como PDF | ✅ | ✅ | ✅ |
| Gerenciar Usuários | ❌ | ❌ | ✅ |
| Visualizar detalhes de usuário | ❌ | ❌ | ✅ |
| Editar usuário (nome, perfil, senha) | ❌ | ❌ | ✅ |
| Ativar / Desativar usuário | ❌ | ❌ | ✅ |
| Visualizar Caixa / Gerir Recebimentos | ✅ | ❌ | ✅ |

> \* Sujeito às **regras de bloqueio por estado da OS** descritas abaixo.

---

## 🔒 Regras de Bloqueio por Estado da OS

### Status de Aprovação

| Condição | Atendente | Técnico | Administrador |
|---|:---:|:---:|:---:|
| Conserto `Pendente` ou `Em Andamento` | ✅ Editável | ✅ Editável | ✅ Editável |
| Conserto `Finalizado` | 🔒 Bloqueado | 🔒 Bloqueado | ✅ Editável |
| Conserto `Cancelado` | 🔒 Bloqueado | 🔒 Bloqueado | ✅ Editável |
| Aprovação já `Reprovado` | 🔒 Bloqueado | 🔒 Bloqueado | ✅ Editável |

### Status do Conserto

| Condição | Atendente | Técnico | Administrador |
|---|:---:|:---:|:---:|
| Conserto `Pendente` ou `Em Andamento` | ❌ Sem acesso | ✅ Editável | ✅ Editável |
| Conserto `Finalizado` | ❌ Sem acesso | 🔒 Bloqueado | ✅ Editável |
| Conserto `Cancelado` | ❌ Sem acesso | 🔒 Bloqueado | ✅ Editável |

### Edição da OS (botão Editar)

| Condição | Atendente | Técnico | Administrador |
|---|:---:|:---:|:---:|
| Aprovação `Reprovado` + Conserto `Cancelado` | 🔒 Bloqueado | 🔒 Bloqueado | ✅ Editável |
| Aprovação `Aprovado` + Conserto `Finalizado` | 🔒 Bloqueado | 🔒 Bloqueado | ✅ Editável |
| Demais estados | ❌ Sem acesso | ✅ Editável | ✅ Editável |

### Regra de Auto-Cancelamento
> Ao definir Aprovação como **Reprovado**, o sistema automaticamente altera o status do conserto para **Cancelado**, independente do perfil do usuário.

---

## 👤 Gestão de Usuários

Disponível exclusivamente para o perfil **Administrador**. A tela exibe uma tabela com todos os usuários e 3 botões de ação por linha:

| Ação | Descrição |
|---|---|
| **Visualizar** | Abre modal com nome, perfil (badge), situação, e-mail, datas de cadastro e atualização |
| **Editar** | Abre modal para alterar nome, perfil de acesso e senha (opcional); e-mail é somente leitura |
| **Ativar / Desativar** | Toggle de acesso imediato; usuários inativos são barrados no login |

> O perfil de acesso é exibido na tabela como um **badge colorido** (sem select inline). A edição do perfil é feita exclusivamente pelo modal de edição.

### Criação de Usuários (sem e-mail de confirmação)
A criação utiliza a **Supabase Admin API** (`email_confirm: true`), garantindo acesso imediato sem necessidade de confirmar e-mail. A implementação usa uma estratégia com fallback gracioso:
1. Tenta invocar a **Edge Function** `create-user` (server-side — chave nunca exposta ao cliente)
2. Se a Edge Function não estiver disponível (404), usa o cliente admin com `service_role key` como fallback

---

## 📄 Exportação de OS em PDF

Cada linha da tabela de ordens de serviço possui um botão **"Exportar"** (ícone 📥). Ao clicar:

1. Uma nova aba é aberta com um documento HTML formatado
2. O diálogo de impressão do navegador é acionado automaticamente
3. O usuário pode salvar como PDF

**Conteúdo do documento exportado:**

| Seção | Dados |
|---|---|
| Cabeçalho | Logo TecFix ERP + Número da OS (`OS-001`) + Data de emissão |
| Dados do Cliente | Nome, E-mail, Telefone |
| Equipamento | Tipo de equipamento |
| Descrição / Histórico | Conteúdo completo do campo de descrição |
| Financeiro | Valor do serviço formatado em BRL |
| Rodapé | Nº OS + data/hora da exportação |

> ⚠️ O navegador precisa **permitir pop-ups** do localhost (ou do domínio onde o sistema está hospedado) para que a exportação funcione.

> ℹ️ Os campos de Status de Aprovação e Status do Conserto foram **removidos do PDF** — o controle de status é feito exclusivamente pela interface.

---

## 🔢 Numeração e Ordenação de OS

- Cada OS recebe um número sequencial estável no formato **`OS-001`**, `OS-002`, `OS-003`...
- A numeração é baseada na **ordem de chegada** (data de criação, `created_at ASC`)
- O número permanece **estável mesmo com filtros ativos** — é calculado pela posição na lista completa, não na lista filtrada
- A coluna **"Nº OS"** é a primeira exibida na tabela

---

## 🚀 Como rodar

### 1. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute os scripts em ordem:
   - `profiles_migration.sql` — cria tabela `profiles`, trigger e políticas RLS
   - `SQL_SETUP.md` — cria tabelas `clientes` e `ordens_servico`
3. Copie a **URL** e a **Anon Key** do projeto (Settings → API)

### 2. Crie o primeiro usuário Administrador

Execute no SQL Editor do Supabase:

```sql
-- Cria o admin diretamente (sem confirmação de e-mail)
DO $$
DECLARE v_user_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'seu@email.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
      created_at, updated_at, role, aud
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'seu@email.com',
      crypt('SuaSenha123', gen_salt('bf')),
      now(),
      '{"nome": "Administrador", "role": "administrador"}',
      '{"provider": "email", "providers": ["email"]}',
      now(), now(), 'authenticated', 'authenticated'
    );
  END IF;
END $$;
```

> **Alternativa:** Use a Supabase Admin API com a `service_role key`:
> ```bash
> curl -X POST "https://SEU_PROJETO.supabase.co/auth/v1/admin/users" \
>   -H "apikey: SERVICE_ROLE_KEY" \
>   -H "Authorization: Bearer SERVICE_ROLE_KEY" \
>   -H "Content-Type: application/json" \
>   -d '{"email":"seu@email.com","password":"SuaSenha123","email_confirm":true,"user_metadata":{"nome":"Administrador","role":"administrador"}}'
> ```

### 3. Configure o ambiente

```bash
cp .env.example .env
```

Conteúdo do `.env`:
```
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Necessária como fallback até o deploy da Edge Function 'create-user'.
# Remova após confirmar que a Edge Function está ativa.
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

> ⚠️ **Produção:** A `service_role key` não deve ficar no bundle cliente. Deploy a Edge Function `supabase/functions/create-user/index.ts` e remova a variável do `.env`.

### 4. (Opcional) Deploy da Edge Function

```bash
npx supabase login
npx supabase functions deploy create-user --project-ref SEU_PROJECT_REF
```

Após o deploy, remova `VITE_SUPABASE_SERVICE_ROLE_KEY` do `.env` — o app usa a Edge Function automaticamente.

### 5. Instale e rode

```bash
npm install
npm run dev
```

Acesse em: **http://localhost:5173**

---

## 🏗️ Estrutura do Projeto

```
src/
  contexts/
    AuthContext.jsx         — Provedor global de autenticação (sessão + perfil)
  components/
    layout/
      Sidebar.jsx           — Navegação lateral responsiva + info do usuário logado
      Header.jsx            — Topbar com título, badge de perfil e refresh
    ui/
      Modal.jsx             — Modal genérico acessível
      ToastContainer.jsx    — Notificações toast
  hooks/
    useAuth.js              — Hook para consumir AuthContext
    useClientes.js          — CRUD de clientes (Supabase)
    useOrdens.js            — CRUD de ordens de serviço (Supabase); ordenação por chegada (ASC)
    useUsuarios.js          — CRUD de usuários/perfis + criação/edição via Admin API / Edge Function
    useTecnicos.js          — Lista técnicos ativos (com loading/error state)
    useToast.js             — Sistema de notificações
  pages/
    Login.jsx               — Tela de login (dark mode, show/hide senha)
    Dashboard.jsx           — Painel com métricas e resumo financeiro (financeiro só para Admin)
    Clientes.jsx            — Gestão de clientes (guard: somente Atendente/Admin cria)
    Ordens.jsx              — Gestão de OS (numeração, exportação, filtros, ações inline + bloqueios RBAC)
    Usuarios.jsx            — Gestão de usuários (somente Admin): listagem, visualizar, editar, ativar/desativar
  utils/
    exportarOS.js           — Utilitário de geração e exportação de OS em PDF (HTML/CSS puro)
    format.js               — Funções compartilhadas: formatCurrency, formatDate
  supabaseClient.js         — Cliente Supabase configurado (exporta supabase e constantes)
  App.jsx                   — Auth gate, roteamento, permissões por role e layout principal
  index.css                 — Design system completo (variáveis, tokens, componentes)

supabase/
  functions/
    create-user/
      index.ts              — Edge Function para criação segura de usuários (server-side)
```

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Frontend SPA |
| Vite | 6 | Bundler e dev server |
| Supabase | JS SDK v2 | Backend / Banco de dados / Auth |
| Vanilla CSS | — | Estilização (Dark Mode, Glassmorphism) |
| lucide-react | latest | Ícones SVG |

---

## 📋 Banco de Dados

### Tabela `auth.users` (gerenciada pelo Supabase Auth)

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único |
| email | TEXT | E-mail de login |
| encrypted_password | TEXT | Hash bcrypt da senha |
| email_confirmed_at | TIMESTAMPTZ | Data de confirmação do e-mail |
| raw_user_meta_data | JSONB | Metadados (nome, role inicial) |

### Tabela `public.profiles`

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID (PK, FK → auth.users) | Mesmo ID do usuário autenticado |
| nome | TEXT NOT NULL | Nome de exibição |
| role | TEXT NOT NULL | Perfil: `atendente` / `tecnico` / `administrador` |
| ativo | BOOLEAN | Define se o usuário tem acesso ao sistema |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Data da última atualização |

> **Trigger:** `on_auth_user_created` — criado automaticamente ao inserir em `auth.users` com `SECURITY DEFINER`, populando `nome` e `role` dos metadados.

> **E-mail:** O campo de e-mail é lido dinamicamente de `auth.users` via Admin API e mesclado ao perfil em tempo de execução (não armazenado em `profiles`).

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
| tecnico_id | UUID (FK → profiles) | Técnico responsável (nullable) |
| descricao | TEXT NOT NULL | Descrição do problema + histórico de observações |
| tipo_equipamento | TEXT NOT NULL | Categoria: Celular, Notebook, Televisão, Tablet, Desktop, Console, Áudio/Som, Outro |
| valor | NUMERIC(10,2) | Valor do serviço (default 0) |
| status | TEXT NOT NULL | Status do conserto: `Pendente` / `Em Andamento` / `Finalizada` / `Cancelada` ¹ |
| status_aprovacao | TEXT NOT NULL | Status de aprovação: `Aguardando` / `Aprovado` / `Reprovado` |
| created_at | TIMESTAMPTZ | Data de abertura da OS (usada para numeração e ordenação) |

> ¹ Os valores `Finalizada` e `Cancelada` são armazenados no banco conforme a constraint original. Na interface são exibidos como **Finalizado** e **Cancelado** (masculino) via mapeamento no frontend.

### Políticas RLS

| Tabela | Política | Descrição |
|---|---|---|
| `profiles` | `profiles_read` | Qualquer usuário autenticado pode ler todos os perfis |
| `profiles` | `profiles_self_update` | Usuário pode atualizar o próprio perfil |
| `profiles` | `profiles_admin_update` | Administradores podem atualizar qualquer perfil |

> **Função auxiliar:** `public.get_my_role()` — `SECURITY DEFINER` para consultar a role sem recursão RLS.

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
| **Login** | Acesso via e-mail e senha; sessão mantida em `localStorage`; usuários inativos são bloqueados na tela de acesso desativado |
| **Criar OS** | Valor é opcional (salva como R$ 0,00); status inicia como **Pendente**; aprovação inicia como **Aguardando** |
| **Editar OS** | Valor é **obrigatório**; todos os campos são editáveis; Técnico e Admin podem editar — exceto quando OS está em estado terminal |
| **Bloquear Edição** | Para Atendente e Técnico: botão Editar é desabilitado quando OS está encerrada (`Reprovado`+`Cancelado` ou `Aprovado`+`Finalizado`). Admin pode editar sempre |
| **Auto-Cancelamento** | Ao definir Status de Aprovação como `Reprovado`, o status do conserto é automaticamente alterado para `Cancelado` |
| **Descrição** | Texto original é bloqueado na edição; novas observações são adicionadas com nome do usuário + data/hora em parágrafo separado |
| **Tipo de equipamento** | Obrigatório na criação e edição |
| **Numeração de OS** | Cada OS recebe número sequencial estável (`OS-001`, `OS-002`...) baseado na ordem de chegada; número não muda com filtros |
| **Ordenação** | OS exibidas por ordem de chegada (mais antigas primeiro); clientes e equipamentos em ordem alfabética (pt-BR) |
| **Status Conserto** | Exibidos como `Finalizado`/`Cancelado` na UI; armazenados como `Finalizada`/`Cancelada` no banco. Apenas Técnico e Administrador alteram |
| **Status Aprovação** | Atendente e Técnico podem alterar; bloqueado quando conserto está em estado terminal; Admin pode alterar sempre |
| **PDF** | Botão "Exportar" para todos os perfis; gera documento com Nº OS, cliente (nome, e-mail, tel.), equipamento, descrição e valor. Status removidos do PDF |
| **Criar usuário** | Disponível apenas para Admin; acesso imediato (sem confirmação de e-mail); usa Edge Function server-side com fallback para Admin API |
| **Editar usuário** | Admin pode alterar nome, perfil e senha; e-mail é somente leitura |
| **Ativar/Desativar** | Admin pode ativar ou desativar qualquer usuário; usuários inativos são barrados ao fazer login |
| **Técnico Responsável** | Definido na edição da OS; bloqueado para Atendente e Técnico após atribuído; somente Admin pode reatribuir |

---

## 🔐 Segurança

| Item | Status | Detalhes |
|---|---|---|
| Row Level Security (RLS) | ✅ Ativo | Todas as tabelas públicas têm políticas RLS configuradas |
| `service_role key` no cliente | ⚠️ Transição | Usada como fallback; remover após deploy da Edge Function |
| Edge Function `create-user` | 🚧 Pendente deploy | Código pronto em `supabase/functions/create-user/index.ts` |
| Logs de dados de usuário | ✅ Removidos | `console.log` com dados de perfil eliminado do `AuthContext` |
| Default `ativo` inseguro | ✅ Corrigido | `ativo ?? null` (antes `?? true`) — falha no carregamento não concede acesso |
| Funções utilitárias duplicadas | ✅ Corrigido | `formatCurrency` e `formatDate` centralizadas em `utils/format.js` |
| `SELECT_FIELDS` em hook | ✅ Otimizado | Movida para escopo de módulo (não recriada a cada render) |
| `filteredClientes` sem memo | ✅ Otimizado | Protegida com `useMemo` |

---

## 📅 Histórico de Alterações

### 2026-06-18
- **Segurança:** Removido `console.log` que expunha dados de perfil no DevTools
- **Segurança:** Corrigido default inseguro `ativo ?? true` → `ativo ?? null`
- **Segurança:** Adicionado `storageKey` distinto ao cliente admin para evitar conflito de sessão GoTrueClient
- **Segurança:** Criada Edge Function `create-user` (server-side) para remover `service_role key` do bundle cliente
- **Otimização:** `SELECT_FIELDS` movido para escopo de módulo em `useOrdens.js`
- **Otimização:** `filteredClientes` protegido com `useMemo` em `Clientes.jsx`
- **Otimização:** Criado `src/utils/format.js` com `formatCurrency` e `formatDate` centralizadas (eliminadas duplicatas em Ordens, Dashboard e exportarOS)
- **Otimização:** `useTecnicos` refatorado com estado `loading` e `error`
- **Usuários — Tabela:** Perfil de acesso exibido como badge colorido (removido select inline)
- **Usuários — Visualizar:** Novo modal de detalhes com nome, perfil, situação, e-mail real, datas de cadastro/atualização
- **Usuários — Editar:** Novo modal de edição com nome, e-mail (somente leitura), nova senha (opcional) e perfil de acesso
- **Usuários — E-mail:** `fetchUsuarios` agora mescla e-mails de `auth.users` para exibição nos modais
- **Usuários — `editarUsuario`:** Nova função no hook para atualizar nome, role e senha via Admin API

### Versões anteriores
Consulte o histórico de commits Git para alterações anteriores a 2026-06-18.
