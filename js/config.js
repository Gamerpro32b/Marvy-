// ============================================
// WEALTH-NAILS - Supabase Configuration
// ============================================

// Supabase Project URL (base URL only)
const SUPABASE_URL = 'https://xdojtbdnwzzviuudojel.supabase.co';

// Supabase Publishable Key
const SUPABASE_ANON_KEY = 'sb_publishable_KBG5XapjMANcG7M0imXHJg_QjR_YfxG';

// ============================================

// Initialize Supabase client (GLOBAL - no const to avoid redeclaration)
supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Wealth-Nails connected to Supabase!');