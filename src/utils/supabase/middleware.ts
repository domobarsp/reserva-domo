import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";
  const isLogoutRoute = pathname === "/admin/logout";

  // Sem sessão + rota admin (exceto login/logout) → redirect login
  if (!user && isAdminRoute && !isLoginRoute && !isLogoutRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Com sessão + rota admin autenticada → verifica is_active e must_change_password
  if (user && isAdminRoute && !isLoginRoute && !isLogoutRoute) {
    const isChangePasswordRoute = pathname === "/admin/trocar-senha";

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("is_active, must_change_password")
      .eq("id", user.id)
      .single();

    if (!adminUser?.is_active) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/logout";
      return NextResponse.redirect(url);
    }

    if (adminUser?.must_change_password && !isChangePasswordRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/trocar-senha";
      return NextResponse.redirect(url);
    }
  }

  // Com sessão + rota login → redirect dashboard
  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
