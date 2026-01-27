'use server';

import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';
import { auth } from '@/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { uploadImage } from '@/lib/cloudinary';

async function checkAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }
}

export async function createCake(prevState: any, formData: FormData) {
    await checkAdmin();
    await dbConnect();

    const name = formData.get('name') as string;
    const basePrice = parseFloat(formData.get('basePrice') as string);
    const description = formData.get('description') as string;
    const allowedShapes = (formData.get('allowedShapes') as string).split(',').map(s => s.trim());
    const allowedFlavors = (formData.get('allowedFlavors') as string).split(',').map(s => s.trim());
    const allowedColors = (formData.get('allowedColors') as string).split(',').map(s => s.trim());
    const allowedDesigns = (formData.get('allowedDesigns') as string).split(',').map(s => s.trim());

    // Handle Image Uploads
    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    if (images && images.length > 0) {
        try {
            for (const file of images) {
                if (file.size > 0 && file.type.startsWith('image/')) {
                    const url = await uploadImage(file);
                    imageUrls.push(url);
                }
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            return { message: 'Image upload failed. Check server logs.' };
        }
    }

    try {
        await Cake.create({
            name,
            basePrice,
            description,
            allowedShapes,
            allowedFlavors,
            allowedColors,
            allowedDesigns,
            isActive: true,
            images: imageUrls
        });
    } catch (e) {
        return { message: 'Failed to create cake' };
    }

    revalidatePath('/admin/cakes');
    redirect('/admin/cakes');
}

export async function updateCake(id: string, prevState: any, formData: FormData) {
    await checkAdmin();
    await dbConnect();

    const name = formData.get('name') as string;
    const basePrice = parseFloat(formData.get('basePrice') as string);
    const description = formData.get('description') as string;
    const allowedShapes = (formData.get('allowedShapes') as string).split(',').map(s => s.trim());
    const allowedFlavors = (formData.get('allowedFlavors') as string).split(',').map(s => s.trim());
    const allowedColors = (formData.get('allowedColors') as string).split(',').map(s => s.trim());
    const allowedDesigns = (formData.get('allowedDesigns') as string).split(',').map(s => s.trim());

    // Handle Image Uploads (Append new ones)
    const images = formData.getAll('images') as File[];
    const newImageUrls: string[] = [];

    if (images && images.length > 0) {
        try {
            for (const file of images) {
                if (file.size > 0 && file.type.startsWith('image/')) {
                    const url = await uploadImage(file);
                    newImageUrls.push(url);
                }
            }
        } catch (error) {
            console.error('Image upload failed during update:', error);
        }
    }

    try {
        const updateData: any = {
            name,
            basePrice,
            description,
            allowedShapes,
            allowedFlavors,
            allowedColors,
            allowedDesigns,
        };

        if (newImageUrls.length > 0) {
            // Push new images to the existing array safely using $push via mongoose or just read-modify-update logic
            // Simple approach: Use $push for atomic update
            await Cake.findByIdAndUpdate(id, {
                $set: updateData,
                $push: { images: { $each: newImageUrls } }
            });
        } else {
            await Cake.findByIdAndUpdate(id, updateData);
        }

    } catch (e) {
        return { message: 'Failed to update cake' };
    }

    revalidatePath('/admin/cakes');
    revalidateTag('cakes');
    revalidateTag('active-cakes');
    return { message: 'Updated successfully' };
}


export async function toggleCakeStatus(id: string, currentStatus: boolean) {
    await checkAdmin();
    await dbConnect();

    await Cake.findByIdAndUpdate(id, { isActive: !currentStatus });
    revalidatePath('/admin/cakes');
    revalidateTag('cakes');
    revalidateTag('active-cakes');
}
