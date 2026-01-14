import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { ZodError } from 'zod';
import { z } from 'zod';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const config = {
    theme: {
        logo: '/cake-logo.png',
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                try {
                    const { email, password } = await signInSchema.parseAsync(credentials);

                    await dbConnect();
                    const user = await User.findOne({ email }).select('+password');

                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;

                    console.log('Invalid credentials');
                    return null;
                } catch (error) {
                    if (error instanceof ZodError) {
                        return null;
                    }
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            if (isOnAdmin) {
                if (isLoggedIn) return true;
                return false;
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

export const { handlers, auth, signIn, signOut } = NextAuth(config);
