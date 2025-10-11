import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  
  // Debug logging
  console.log(`🔍 Middleware - Path: ${pathname}, Token: ${token ? 'EXISTS' : 'MISSING'}`);

  // Define what routes are completely public (no auth needed)
  const isLandingPage = pathname === '/';
  const isPublicStatusPage = pathname.startsWith('/public_page_view');
  const isAuthPage = pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const isAcceptInvitation = pathname.startsWith('/accept-invitation');
  const isApiRoute = pathname.startsWith('/api');
  
  // Skip middleware for API routes (they handle auth internally)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // These are the ONLY routes that don't need authentication
  const isPublicRoute = isLandingPage || isPublicStatusPage || isAcceptInvitation;
  
  console.log(`🔍 Landing: ${isLandingPage}, Public Status: ${isPublicStatusPage}, Auth Page: ${isAuthPage}, Public Route: ${isPublicRoute}`);
  
  // If user is logged in, keep them out of auth pages
  if (isAuthPage && token) {
    console.log('🔄 Redirecting authenticated user from auth page to dashboard');
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // If user is not logged in and trying to access ANY protected route, redirect to signin
  // Protected routes = everything except landing page, public status pages, auth pages, and accept invitation
  if (!isAuthPage && !isPublicRoute && !token) {
    console.log('🔄 Redirecting unauthenticated user to signin');
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('redirect', pathname + (request.nextUrl.search || ''));
    return NextResponse.redirect(url);
  }

  console.log('✅ Allowing request to proceed');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};