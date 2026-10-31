import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// O login é feito pelo backend, então o navegador não tem sessão do Supabase. As policies do
// Storage exigem o papel "authenticated": criamos um cliente que repassa o JWT do usuário no
// header Authorization. O cliente é criado sob demanda (não no import) para que telas que não
// usam o Supabase continuem funcionando mesmo se as VITE_SUPABASE_* não estiverem definidas.
export function createSupabaseWithToken(accessToken) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Upload de foto indisponível: configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}
