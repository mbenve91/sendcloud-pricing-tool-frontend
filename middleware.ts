import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const isLoginPage = request.nextUrl.pathname === '/login';
    
    console.log('Middleware running', { 
        path: request.nextUrl.pathname, 
        hasToken: !!token, 
        isLoginPage 
    });

    if (!token && !isLoginPage) {
        console.log('No token and not login page, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isLoginPage) {
        console.log('Has token and on login page, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('Middleware continuing to next');
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 