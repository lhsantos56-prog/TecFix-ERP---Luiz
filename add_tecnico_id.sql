-- ============================================================
-- Migração completa: coluna tecnico_id + vínculo dos chamados
-- Execute no SQL Editor do Supabase (Painel > SQL Editor)
-- ============================================================

-- 1. Adiciona a coluna (nullable, com FK para profiles)
ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS tecnico_id UUID
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- 2. Índice para performance
CREATE INDEX IF NOT EXISTS idx_ordens_tecnico_id
  ON public.ordens_servico(tecnico_id);

-- ============================================================
-- 3. Vincula TODOS os chamados existentes ao único técnico
--    cadastrado no sistema (ajuste o e-mail se necessário)
-- ============================================================
UPDATE public.ordens_servico
SET tecnico_id = (
  SELECT id FROM public.profiles
  WHERE role = 'tecnico'
    AND ativo = true
  ORDER BY created_at
  LIMIT 1
)
WHERE tecnico_id IS NULL;

-- 4. Verifica resultado
SELECT
  os.id,
  c.nome AS cliente,
  os.status,
  p.nome AS tecnico_responsavel
FROM public.ordens_servico os
LEFT JOIN public.clientes c ON c.id = os.cliente_id
LEFT JOIN public.profiles p ON p.id = os.tecnico_id
ORDER BY os.created_at;
