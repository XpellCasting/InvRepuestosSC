import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gimnxwirfvnxiuptwcfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbW54d2lyZnZueGl1cHR3Y2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTk1NDMsImV4cCI6MjA4OTc5NTU0M30.BacdmKryJUVfMaieJmPKuHoU1t0a_xzm_jZzLlhPhXI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('Probando conexión con Supabase REST API...');
  const { data, error } = await supabase.from('distribuidores').select('*').limit(1);
  if (error) {
    console.error('❌ Error API Supabase:', error);
  } else {
    console.log('✅ Conexión a la API correcta! Datos:', data);
  }
}

testSupabase();
