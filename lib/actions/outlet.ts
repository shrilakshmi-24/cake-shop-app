'use server';

import dbConnect from '@/lib/db/connect';
import Outlet, { IOutlet } from '@/lib/db/models/Outlet';
import { revalidatePath } from 'next/cache';

export async function createOutlet(data: Partial<IOutlet>) {
    await dbConnect();
    try {
        const outlet = await Outlet.create(data);
        revalidatePath('/admin/outlets');
        return JSON.parse(JSON.stringify(outlet));
    } catch (error) {
        throw new Error('Failed to create outlet: ' + error);
    }
}



export async function getOutlets() {
    await dbConnect();
    try {
        const outlets = await Outlet.find({}).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(outlets));
    } catch {
        throw new Error('Failed to fetch outlets');
    }
}

export async function updateOutlet(id: string, data: Partial<IOutlet>) {
    await dbConnect();
    try {
        const outlet = await Outlet.findByIdAndUpdate(id, data, { new: true });
        revalidatePath('/admin/outlets');
        return JSON.parse(JSON.stringify(outlet));
    } catch {
        throw new Error('Failed to update outlet');
    }
}

export async function deleteOutlet(id: string) {
    await dbConnect();
    try {
        await Outlet.findByIdAndDelete(id);
        revalidatePath('/admin/outlets');
    } catch {
        throw new Error('Failed to delete outlet');
    }
}
