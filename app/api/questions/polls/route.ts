import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET polls
export async function GET() {
  const { data, error } = await supabase.from("polls").select("*");

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json(data);
}

// CREATE poll
export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("polls")
    .insert([{ question: body.question }])
    .select();

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json(data);
}