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

import { authConfig } from '@/auth.config';

export const config = {
    ...authConfig,
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
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
