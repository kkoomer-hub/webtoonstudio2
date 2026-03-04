import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignore
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 코드 교환 성공 → users 테이블에 사용자 정보 upsert
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('users').upsert(
          {
            id: user.id,
            email: user.email ?? '',
            name:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              user.email?.split('@')[0] ??
              '이름없음',
            avatar_url: user.user_metadata?.avatar_url ?? null,
          },
          { onConflict: 'id' }
        );
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // 오류 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
