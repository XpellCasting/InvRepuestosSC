// test.cjs
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gimnxwirfvnxiuptwcfk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbW54d2lyZnZueGl1cHR3Y2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTk1NDMsImV4cCI6MjA4OTc5NTU0M30.BacdmKryJUVfMaieJmPKuHoU1t0a_xzm_jZzLlhPhXI'; // Tu llave completa

const supabase = createClient(supabaseUrl, supabaseKey);

// Añadimos una prueba real para ver si conecta
async function probarConexion() {
  const { data, error } = await supabase.from('productos').select('*').limit(1);
  
  if (error) {
    console.error('❌ Error de conexión:', error.message);
  } else {
    console.log('✅ ¡Conexión exitosa a Supabase!');
    console.log('Datos recibidos:', data);
  }
}

probarConexion();