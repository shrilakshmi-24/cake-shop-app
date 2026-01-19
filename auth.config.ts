import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    theme: {
        logo: '/cake-logo.png',
    },
    providers: [], // Providers added in auth.ts
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnProtected = nextUrl.pathname.startsWith('/checkout') ||
                nextUrl.pathname.startsWith('/orders');

            if (isOnAdmin) {
                if (isLoggedIn && (auth?.user as any).role === 'admin') return true;
                return false; // Redirect unauthenticated or non-admin users
            }

            if (isOnProtected) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                // Explicitly cast ObjectId to string to prevent object/buffer issues
                token.id = ((user as any)._id || user.id).toString();
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id || token.sub;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
} satisfies NextAuthConfig;
