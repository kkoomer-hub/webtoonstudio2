import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CREDIT_COSTS } from "@/lib/credits";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ credits: 0, costs: CREDIT_COSTS });
    }

    const { data } = await supabase
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      credits: data?.credits ?? 0,
      costs: CREDIT_COSTS,
    });
  } catch {
    return NextResponse.json({ credits: 0, costs: CREDIT_COSTS });
  }
}
