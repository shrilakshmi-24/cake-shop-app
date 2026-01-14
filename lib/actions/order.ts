'use server';

import dbConnect from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { CakeConfig } from '@/lib/types/customization';
import { auth } from '@/auth';

import { uploadImage } from '@/lib/cloudinary';

export async function createOrder(formData: FormData) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return { success: false, error: 'Authentication required' };
        }

        await dbConnect();

        // Extract data
        const shape = formData.get('shape') as string;
        const flavor = formData.get('flavor') as string;
        const color = formData.get('color') as string;
        const design = formData.get('design') as string;
        const message = formData.get('message') as string;
        const price = parseFloat(formData.get('price') as string);
        const cakeId = formData.get('cakeId') as string;

        // Use provided cakeId or fallback to dummy (though in new flow cakeId should always be present)
        const targetCakeId = cakeId || '000000000000000000000000';

        let customImageUrl;
        const imageFile = formData.get('customImage') as File;

        if (imageFile && imageFile.size > 0) {
            try {
                customImageUrl = await uploadImage(imageFile);
            } catch (e) {
                console.error('User image upload failed', e);
                return { success: false, error: 'Failed to upload custom image' };
            }
        }

        const config: CakeConfig = {
            shape: shape as any,
            flavor: flavor as any,
            color: color as any,
            design: design as any,
            message,
            customImage: customImageUrl
        };

        // Create the order
        const order = await Order.create({
            userId: (session.user as any).id,
            cakeId: targetCakeId,
            customizationSnapshot: config,
            finalPrice: price,
            status: 'PLACED'
        });

        return { success: true, orderId: order._id.toString() };
    } catch (error) {
        console.error('Failed to create order:', error);
        return { success: false, error: 'Failed to create order' };
    }
}
