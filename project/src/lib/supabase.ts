import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Valeurs par défaut pour le mode sans Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-key'

// Création d'un client factice qui ne fera pas d'appels réels
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Log pour indiquer que nous sommes en mode sans Supabase
console.log('Mode sans Supabase activé - les fonctionnalités Supabase sont désactivées')