-- Corrige as políticas RLS que causam problema de recursão
-- A política FOR ALL com subquery na mesma tabela bloqueia SELECTs

-- Remove políticas problemáticas
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_write ON public.profiles;

-- Cria uma função SECURITY DEFINER para verificar role sem recursão RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Policy 1: qualquer usuário autenticado pode LER todos os perfis
CREATE POLICY profiles_read
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: usuários podem atualizar o próprio perfil
CREATE POLICY profiles_self_update
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy 3: administradores podem atualizar qualquer perfil
CREATE POLICY profiles_admin_update
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'administrador')
  WITH CHECK (public.get_my_role() = 'administrador');

-- Policy 4: trigger (service_role) pode inserir - bypass de RLS automático
-- Nenhuma policy INSERT adicional necessária pois trigger usa SECURITY DEFINER

-- Verifica se o perfil do admin está legível
SELECT id, nome, role, ativo
FROM public.profiles
WHERE id = '47ac3318-1f55-4cf4-b34c-9664b17e1461';
