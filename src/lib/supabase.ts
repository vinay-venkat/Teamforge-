/// <reference types="vite/client" />
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    supabase = null;
  }
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isConfigured: boolean;
  provider: 'supabase' | 'demo';
}

// Function to trigger Google OAuth with Supabase
export async function signInWithSupabaseGoogle(): Promise<{ error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { error: 'Supabase credentials are not configured yet.' };
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err?.message || 'Error during Google sign-in' };
  }
}

// Function to sign out
export async function signOutSupabase(): Promise<void> {
  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error signing out of Supabase:', err);
    }
  }
}
