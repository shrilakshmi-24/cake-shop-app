'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function register(prevState: string | undefined, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (!email || !password || password.length < 6) {
        return 'Invalid input';
    }

    try {
        await dbConnect();

        const existing = await User.findOne({ email });
        if (existing) {
            return 'User already exists';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            email,
            password: hashedPassword,
            name
        });

        // Ideally redirect or log them in. For now, valid return.
        return 'success';
    } catch (e) {
        console.error(e);
        return 'Failed to register';
    }
}
