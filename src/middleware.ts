import { NextResponse, type NextRequest } from "next/server";
import { unauthenticatedRoutes } from "@/lib/util";

export default async function middleware(request: NextRequest) {
  console.log(`Middleware called for: ${request.nextUrl.pathname}`);

  if (isApiRequest(request)) {
    console.log("API request - allowing");
    return NextResponse.next();
  }

  if (isUnauthenticatedRoute(request)) {
    console.log("Unauthenticated route - allowing");
    return NextResponse.next();
  }

  console.log("Protected route - redirecting to login");
  return NextResponse.redirect(new URL("/login", request.url));
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
