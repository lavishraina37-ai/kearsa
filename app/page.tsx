import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { data, error } = await supabase.from("questions").select("*");

  if (error) {
    return <pre>Error: {JSON.stringify(error)}</pre>;
  }

  return (
    <div>
      <h1>Debug Questions</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}