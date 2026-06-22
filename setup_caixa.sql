-- Execute este script no SQL Editor do Supabase para adicionar suporte ao Caixa

ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS status_pagamento TEXT NOT NULL DEFAULT 'Pendente'
  CHECK (status_pagamento IN ('Pendente', 'Pago')),
  
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT
  CHECK (forma_pagamento IN ('Crédito', 'Débito', 'Dinheiro', 'PIX', NULL));

-- Atualizar ordens antigas Finalizadas para já estarem Pagas (opcional, mas recomendado para não poluir o caixa com OS muito antigas)
-- Descomente a linha abaixo se desejar:
-- UPDATE public.ordens_servico SET status_pagamento = 'Pago' WHERE status = 'Finalizada';
