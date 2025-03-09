/**
 * Utilitaire pour tester les variables d'environnement
 */

export function logEnvVars() {
  console.log('Variables d\'environnement:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Définie' : 'Non définie');
  console.log('VITE_ENEDIS_CLIENT_ID:', import.meta.env.VITE_ENEDIS_CLIENT_ID);
  console.log('VITE_ENEDIS_REDIRECT_URI:', import.meta.env.VITE_ENEDIS_REDIRECT_URI);
}