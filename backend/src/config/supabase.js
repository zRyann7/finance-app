
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  throw new Error("Configure o Supabase no .env");
}

function createSupabaseClient(accessToken) {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    ...(accessToken && {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }),
  });
}

async function revokeSession(accessToken) {
  const response = await fetch(`${url}/auth/v1/logout?scope=local`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 401) {
    throw new Error(`Supabase Auth respondeu com status ${response.status}.`);
  }
}

module.exports = { createSupabaseClient, revokeSession };
