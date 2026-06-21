import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

// Rota padrão do Supabase para confirmação de magic link (token_hash + type)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const resolvedType: EmailOtpType = type === "magiclink" ? "email" : (type ?? "email");

  if (token_hash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: resolvedType, token_hash });

    console.log("[auth/confirm]", { token_hash: token_hash.slice(0, 20), type: resolvedType, error: error?.message });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}/login?error=sem_token`);
}
