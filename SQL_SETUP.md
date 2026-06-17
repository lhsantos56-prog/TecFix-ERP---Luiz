# 🗄️ Configuração do Banco de Dados — Supabase

Execute os scripts SQL abaixo no **SQL Editor** do seu projeto Supabase.

## 1. Criação das Tabelas

```sql
-- =============================================
-- Tabela: clientes
-- =============================================
CREATE TABLE IF NOT EXISTS public.clientes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefone    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- Tabela: ordens_servico
-- =============================================
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id       UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  descricao        TEXT NOT NULL,
  tipo_equipamento TEXT NOT NULL DEFAULT 'Outro'
                   CHECK (tipo_equipamento IN ('Celular', 'Notebook', 'Televisão', 'Tablet', 'Desktop', 'Console', 'Áudio/Som', 'Outro')),
  valor            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'Pendente'
                   CHECK (status IN ('Pendente', 'Em Andamento', 'Finalizada', 'Cancelada')),
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índice para busca por cliente
CREATE INDEX IF NOT EXISTS idx_ordens_cliente_id ON public.ordens_servico(cliente_id);
-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_ordens_status ON public.ordens_servico(status);
```

## 2. Row Level Security (RLS) — Diferencial

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

-- Políticas: Acesso público com anon key (para desenvolvimento)
-- Em produção, substitua por políticas baseadas em auth.uid()

CREATE POLICY "Permitir leitura pública de clientes"
  ON public.clientes FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de clientes"
  ON public.clientes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de clientes"
  ON public.clientes FOR DELETE
  USING (true);

CREATE POLICY "Permitir leitura pública de ordens"
  ON public.ordens_servico FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de ordens"
  ON public.ordens_servico FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de ordens"
  ON public.ordens_servico FOR UPDATE
  USING (true);

CREATE POLICY "Permitir exclusão pública de ordens"
  ON public.ordens_servico FOR DELETE
  USING (true);
```

## 3. Dados de Exemplo (opcional)

```sql
-- Inserir clientes de exemplo
INSERT INTO public.clientes (nome, email, telefone) VALUES
  ('Carlos Oliveira', 'carlos@email.com', '(11) 98765-4321'),
  ('Maria Santos', 'maria@email.com', '(21) 99123-4567'),
  ('João Ferreira', 'joao@email.com', '(31) 91234-5678');

-- Inserir OS de exemplo (use os IDs dos clientes inseridos acima)
-- Substitua os UUIDs pelos IDs reais retornados pelo INSERT acima
INSERT INTO public.ordens_servico (cliente_id, descricao, valor, status)
SELECT
  id,
  'Troca de tela quebrada',
  350.00,
  'Pendente'
FROM public.clientes WHERE nome = 'Carlos Oliveira';

INSERT INTO public.ordens_servico (cliente_id, descricao, valor, status)
SELECT
  id,
  'Limpeza interna e troca de pasta térmica',
  120.00,
  'Em Andamento'
FROM public.clientes WHERE nome = 'Maria Santos';

INSERT INTO public.ordens_servico (cliente_id, descricao, valor, status)
SELECT
  id,
  'Substituição de bateria viciada',
  200.00,
  'Finalizada'
FROM public.clientes WHERE nome = 'João Ferreira';
```
