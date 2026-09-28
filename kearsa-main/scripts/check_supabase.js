// Load .env.local if present, then fall back to .env
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment');
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Supabase query error:', error);
      process.exit(2);
    }

    console.log('Questions sample:', data);
  } catch (err) {
    console.error('Fetch failed:', err);
    process.exit(3);
  }
})();
