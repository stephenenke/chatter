import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's an API route that needs protection
  if (pathname.startsWith('/api') && 
      !pathname.startsWith('/api/auth') && 
      !pathname.startsWith('/api/public')) {
    const token = await getToken({ req: request });
    
    // Not logged in, return 401
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // Protect app routes that should require authentication
  if (pathname !== '/auth/signin' && 
      pathname !== '/auth/error' && 
      !pathname.startsWith('/api') && 
      !pathname.includes('/_next') && 
      !pathname.includes('/favicon.ico')) {
    const token = await getToken({ req: request });
    
    // Not logged in, redirect to sign in page
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    // Match all paths except for these
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};