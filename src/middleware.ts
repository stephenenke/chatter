import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that should not require authentication
  const isPublicPath = 
    pathname === '/auth/signin' || 
    pathname === '/auth/error' || 
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/api/public');

  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Check if it's an API route that needs protection
  if (pathname.startsWith('/api') && !isPublicPath) {
    // Not logged in, return 401
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // Protect app routes that should require authentication
  if (!isPublicPath && 
      !pathname.includes('/_next') && 
      !pathname.includes('/favicon.ico')) {
    // Not logged in, redirect to sign in page
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};