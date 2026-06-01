import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
};

export default async function handler(req, res) {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });

  if (req.method === 'POST') {
    const { action, email, password } = req.body ?? {};

    if (action === 'signup') {
      const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
      return error ? res.status(400).json({ error: error.message }) : res.status(200).json({ user: data.user });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end();
}
