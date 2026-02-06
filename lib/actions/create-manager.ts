'use server';

import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';

export async function createOutletManager(outletId: string, email: string, name: string) {
    if (!outletId || !email || !name) throw new Error('Missing fields');

    await dbConnect();

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const manager = await User.create({
        email,
        name,
        password: hashedPassword,
        role: 'outlet_manager',
        outletId
    });

    return JSON.parse(JSON.stringify(manager));
}
