-- ============================================================
-- Migração: Renomear status de OS
-- 'Finalizada' → 'Finalizado'
-- 'Cancelada'  → 'Cancelado'
--
-- PASSO 1: Remove a constraint antiga que bloqueia os novos valores
-- PASSO 2: Recria a constraint com os valores corretos
-- PASSO 3: Atualiza os registros existentes
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Remove a check constraint antiga
ALTER TABLE public.ordens_servico
  DROP CONSTRAINT IF EXISTS ordens_servico_status_check;

-- 2. Recria a constraint aceitando os novos nomes
ALTER TABLE public.ordens_servico
  ADD CONSTRAINT ordens_servico_status_check
  CHECK (status IN ('Pendente', 'Em Andamento', 'Finalizado', 'Cancelado'));

-- 3. Migra os dados existentes
UPDATE public.ordens_servico
  SET status = 'Finalizado'
  WHERE status = 'Finalizada';

UPDATE public.ordens_servico
  SET status = 'Cancelado'
  WHERE status = 'Cancelada';

-- 4. Verificar resultado:
SELECT status, COUNT(*) AS total
FROM public.ordens_servico
GROUP BY status
ORDER BY status;
