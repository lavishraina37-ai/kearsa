import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabase.from("votes").insert([
    {
      poll_id: body.poll_id,
      option: body.option,
    },
  ]);

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json(data);
}