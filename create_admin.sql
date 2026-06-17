-- Remove o usuário com hash inválido para recriar corretamente via API
DELETE FROM auth.users WHERE email = 'lhsantos56@gmail.com';

-- Confirma remoção
SELECT COUNT(*) AS usuarios_restantes FROM auth.users WHERE email = 'lhsantos56@gmail.com';
