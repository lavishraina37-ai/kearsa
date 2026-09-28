import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qoeokzklbgjcqkgviouv.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_O0VGhwM8ZdDjNqduhxb7Rw_NwPuWPzA"
);
