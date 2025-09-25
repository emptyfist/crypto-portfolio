import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { unauthenticatedRoutes } from "@/lib/routes";

export default async function middleware(request: NextRequest) {
  if (isApiRequest(request)) {
    return NextResponse.next();
  }

  if (isUnauthenticatedRoute(request)) {
    return NextResponse.next();
  }

  try {
    // Create a response object
    const response = NextResponse.next();

    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    // Check if user is authenticated
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  } catch (error) {
    console.error("Middleware authentication error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|robots\\.txt|sitemap\\.xml|manifest\\.json|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

function isApiRequest(req: NextRequest) {
  return req.nextUrl.pathname.startsWith("/api");
}

function isUnauthenticatedRoute(req: NextRequest) {
  return unauthenticatedRoutes().includes(req.nextUrl.pathname);
}
