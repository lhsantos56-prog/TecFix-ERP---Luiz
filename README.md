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
- ✅ **Controle de Acesso por Perfil (RBAC)** — 3 tipos de usuário com permissões distintas
- ✅ **Gestão de Usuários** — Administradores podem criar e gerenciar usuários diretamente pelo ERP
- ✅ **Busca por Texto** — Filtra OS por nome do cliente ou descrição em tempo real
- ✅ **Tipo de Equipamento** — Campo de categorização: Celular, Notebook, Televisão, Tablet, Desktop, Console, Áudio/Som, Outro
- ✅ **Status do Conserto** — Pendente / Em Andamento / Finalizada / Cancelada (atualização inline por linha)
- ✅ **Status de Aprovação** — Aguardando / Aprovado / Reprovado (atualização inline independente)
- ✅ **Bloqueio de Aprovação** — Status de Aprovação bloqueado para Atendentes e Técnicos quando conserto está Finalizado, Cancelado ou aprovação já é Reprovado
- ✅ **Histórico de Descrição** — Texto original bloqueado (somente leitura); novas observações adicionadas com data/hora automática
- ✅ **Valor Flexível** — Opcional na criação (salva como R$ 0,00); obrigatório ao editar
- ✅ **Ordenação Alfabética** — Clientes e tipos de equipamento ordenados por nome (pt-BR)
- ✅ **Modal de Edição Completa** — Edita todos os campos da OS (cliente, equipamento, descrição, valor, status do conserto e aprovação)
- ✅ **Row Level Security (RLS)** — Políticas de segurança no Supabase com função `SECURITY DEFINER` para evitar recursão
- ✅ **UI/UX Premium** — Dark mode, glassmorphism, micro-animações, toasts de feedback
- ✅ **Responsividade** — Sidebar colapsável em mobile com menu hamburger

---

## 🔐 Perfis de Acesso (RBAC)

| Permissão | Atendente | Técnico | Administrador |
|---|:---:|:---:|:---:|
| Visualizar Dashboard | ✅ | ✅ | ✅ |
| Visualizar Clientes | ✅ | ✅ | ✅ |
| Criar Clientes | ✅ | ❌ | ✅ |
| Visualizar OS | ✅ | ✅ | ✅ |
| Criar OS | ✅ | ❌ | ✅ |
| Editar OS (modal completo) | ❌ | ✅ | ✅ |
| Alterar Status do Conserto | ❌ | ✅ | ✅ |
| Alterar Status de Aprovação | ✅* | ❌ | ✅ |
| Gerenciar Usuários | ❌ | ❌ | ✅ |

> *Atendente pode alterar Status de Aprovação **somente** quando Status do Conserto for `Pendente` ou `Em Andamento` — e desde que a aprovação não seja `Reprovado`.

### Regras de Bloqueio da Aprovação

| Estado do Conserto / Aprovação | Atendente | Técnico | Administrador |
|---|:---:|:---:|:---:|
| Conserto `Pendente` ou `Em Andamento` | ✅ Editável | ❌ Sem acesso | ✅ Editável |
| Conserto `Finalizada` | 🔒 Bloqueado | 🔒 Bloqueado | ✅ Editável |
| Conserto `Cancelada` | 🔒 Bloqueado | 🔒 Bloqueado | ✅ Editável |
| Aprovação já `Reprovado` | 🔒 Bloqueado | 🔒 Bloqueado | ✅ Editável |

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
```

### 4. Instale e rode

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
    useOrdens.js            — CRUD de ordens de serviço (Supabase)
    useUsuarios.js          — CRUD de usuários/perfis + criação via Admin API
    useToast.js             — Sistema de notificações
  pages/
    Login.jsx               — Tela de login (dark mode, show/hide senha)
    Dashboard.jsx           — Painel com métricas e resumo financeiro
    Clientes.jsx            — Gestão de clientes (guard: somente Atendente/Admin cria)
    Ordens.jsx              — Gestão de OS (criação, edição, filtros, ações inline + bloqueios RBAC)
    Usuarios.jsx            — Gestão de usuários (somente Administrador)
  supabaseClient.js         — Cliente Supabase configurado (exporta URL e Anon Key)
  App.jsx                   — Auth gate, roteamento, permissões por role e layout principal
  index.css                 — Design system completo (variáveis, tokens, componentes)
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

> **Trigger:** `on_auth_user_created` — criado automaticamente ao inserir em `auth.users` com `SECURITY DEFINER`, populando `nome` e `role` dos metadados.

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
| status | TEXT NOT NULL | Status do conserto: `Pendente` / `Em Andamento` / `Finalizada` / `Cancelada` |
| status_aprovacao | TEXT NOT NULL | Status de aprovação: `Aguardando` / `Aprovado` / `Reprovado` |
| created_at | TIMESTAMPTZ | Data de abertura da OS |

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
| **Editar OS** | Valor é **obrigatório**; todos os campos são editáveis (apenas por Técnico ou Administrador) |
| **Descrição** | Texto original é bloqueado na edição; novas observações são adicionadas com timestamp automático em parágrafo separado |
| **Tipo de equipamento** | Obrigatório na criação e edição |
| **Ordenação** | Clientes e equipamentos exibidos em ordem alfabética (pt-BR) |
| **Status Conserto** | Apenas Técnico e Administrador podem alterar |
| **Status Aprovação** | Apenas Atendente e Administrador podem alterar; bloqueado para não-admins quando conserto está `Finalizada` ou `Cancelada`, ou quando aprovação já é `Reprovado` |
| **Gestão de usuários** | Criação de novos usuários disponível apenas para Administrador; criação usa `supabase.auth.signUp` com cliente isolado para não deslogar o admin |
| **Ativar/Desativar usuário** | Administrador pode ativar ou desativar o acesso de qualquer usuário via toggle na tabela de usuários |
