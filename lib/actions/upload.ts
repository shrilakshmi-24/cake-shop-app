'use server';

import { uploadImage } from '@/lib/cloudinary';

export async function uploadOptionImageAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file provided');
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        // Validate file size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size too large (max 5MB)');
        }

        const secureUrl = await uploadImage(file);
        return { success: true, url: secureUrl };
    } catch (error: any) {
        console.error('Upload Action Error:', error);
        return { success: false, error: error.message || 'Upload failed' };
    }
}
