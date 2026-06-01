import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
};

export default async function handler(req, res) {
  const supabase = getSupabase();

  if (!supabase) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  if (req.method === 'POST') {
    const { user_id, lesson_id, wpm, accuracy, xp } = req.body ?? {};
    if (!user_id || !lesson_id) return res.status(400).json({ error: 'Missing fields' });

    const { data, error } = await supabase.from('progress').insert([
      { user_id, lesson_id, wpm, accuracy, xp, completed_at: new Date().toISOString() }
    ]);

    return error ? res.status(500).json({ error: error.message }) : res.status(200).json({ data });
  }

  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', user_id)
      .order('completed_at', { ascending: false });

    return error ? res.status(500).json({ error: error.message }) : res.status(200).json({ data });
  }

  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
