import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return (
        <div style={{ color: "red" }}>
          <h2>Supabase Error</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return <div>No questions found in database</div>;
    }

    return (
      <div style={{ padding: "20px" }}>
        <h1>Debug Questions</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  } catch (err: any) {
    return (
      <div style={{ color: "red" }}>
        <h2>Server Crash Error</h2>
        <pre>{err?.message || JSON.stringify(err, null, 2)}</pre>
      </div>
    );
  }
}