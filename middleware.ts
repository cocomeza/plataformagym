import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Por ahora, solo permitir que todas las rutas pasen
  // La protección se maneja en el cliente con ProtectedRoute
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
     * - _vercel (Vercel internals)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|_vercel).*)',
  ],
};
