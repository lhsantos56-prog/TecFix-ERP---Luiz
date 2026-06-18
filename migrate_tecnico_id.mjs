// Script de migração — executa via Node.js
// Usa o Supabase JS SDK com service_role key para chamar função SQL
// Execute: node migrate_tecnico_id.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ohkgzikvdsffwqexgkfh.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oa2d6aWt2ZHNmZndxZXhna2ZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTcwMTA0MywiZXhwIjoyMDk3Mjc3MDQzfQ.fiuyBf2xeDI3Zcf5P8Er4nCgkairrC1w77-l6mcVJHY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function run() {
  console.log('🔧 Verificando se coluna tecnico_id já existe...');
  
  // 1. Verifica se a coluna existe via query nos information_schema
  const { data: cols, error: colErr } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', 'ordens_servico')
    .eq('column_name', 'tecnico_id');

  if (colErr) {
    console.log('Não foi possível verificar via REST. Tentando via RPC...');
  } else if (cols && cols.length > 0) {
    console.log('✅ Coluna tecnico_id já existe! Nada a fazer com o ALTER TABLE.');
  } else {
    console.log('⚠️  Coluna não existe ainda. Precisa rodar o SQL manualmente.');
  }

  // 2. Busca o primeiro técnico ativo
  console.log('\n🔍 Buscando técnico ativo...');
  const { data: tecnico, error: tecErr } = await supabase
    .from('profiles')
    .select('id, nome')
    .eq('role', 'tecnico')
    .eq('ativo', true)
    .order('created_at')
    .limit(1)
    .single();

  if (tecErr || !tecnico) {
    console.error('❌ Nenhum técnico ativo encontrado:', tecErr?.message);
    process.exit(1);
  }
  console.log(`✅ Técnico encontrado: ${tecnico.nome} (${tecnico.id})`);

  // 3. Busca todas as OS
  console.log('\n📋 Buscando ordens de serviço...');
  const { data: ordens, error: ordErr } = await supabase
    .from('ordens_servico')
    .select('id, tecnico_id');

  if (ordErr) {
    console.error('❌ Erro ao buscar OS:', ordErr.message);
    if (ordErr.message.includes('tecnico_id')) {
      console.log('\n⚠️  A coluna tecnico_id ainda NÃO existe no banco.');
      console.log('Execute o seguinte SQL no Supabase SQL Editor:');
      console.log(`
ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS tecnico_id UUID
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

UPDATE public.ordens_servico
SET tecnico_id = '${tecnico.id}'
WHERE tecnico_id IS NULL;
`);
    }
    process.exit(1);
  }

  console.log(`✅ ${ordens.length} OS encontradas`);
  const semTecnico = ordens.filter(o => !o.tecnico_id);
  console.log(`   ${semTecnico.length} sem técnico atribuído`);

  if (semTecnico.length === 0) {
    console.log('\n✅ Todas as OS já têm técnico atribuído. Migração concluída!');
    process.exit(0);
  }

  // 4. Atualiza as OS sem técnico
  console.log(`\n🔄 Vinculando ${semTecnico.length} OS ao técnico ${tecnico.nome}...`);
  const ids = semTecnico.map(o => o.id);
  
  const { error: updErr } = await supabase
    .from('ordens_servico')
    .update({ tecnico_id: tecnico.id })
    .in('id', ids);

  if (updErr) {
    console.error('❌ Erro ao atualizar:', updErr.message);
    process.exit(1);
  }

  console.log(`✅ ${semTecnico.length} OS vinculadas ao técnico ${tecnico.nome}!`);
  console.log('\n🎉 Migração concluída com sucesso!');
}

run().catch(console.error);
