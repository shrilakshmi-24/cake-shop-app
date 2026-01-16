'use server';

import dbConnect from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { CakeConfig } from '@/lib/types/customization';
import { auth } from '@/auth';

import { uploadImage } from '@/lib/cloudinary';
import { calculatePrice } from '@/lib/utils/pricing';

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
        const weight = formData.get('weight') as string;
        const eggType = formData.get('eggType') as string;
        const message = formData.get('message') as string;
        const notes = formData.get('notes') as string;
        const deliveryDate = formData.get('deliveryDate') as string;
        const deliveryTime = formData.get('deliveryTime') as string;
        // Address Fields
        const houseNo = formData.get('address_houseNo') as string;
        const street = formData.get('address_street') as string;
        const landmark = formData.get('address_landmark') as string;
        const city = formData.get('address_city') as string;
        const zip = formData.get('address_zip') as string;
        const lat = formData.get('address_lat') ? parseFloat(formData.get('address_lat') as string) : undefined;
        const lng = formData.get('address_lng') ? parseFloat(formData.get('address_lng') as string) : undefined;

        const cakeId = formData.get('cakeId') as string;

        if (!houseNo || !street || !city || !zip) {
            return { success: false, error: 'Incomplete delivery address' };
        }

        const deliveryAddressObj = {
            houseNo,
            street,
            landmark,
            city,
            zip,
            coordinates: (lat && lng) ? { lat, lng } : undefined,
            googleMapUrl: (lat && lng) ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : undefined,
            fullFormatted: `${houseNo}, ${street}, ${landmark ? landmark + ', ' : ''}${city} - ${zip}`
        };

        // Use provided cakeId or fallback to dummy (though in new flow cakeId should always be present)
        const targetCakeId = cakeId || '000000000000000000000000';

        let printImageUrl;
        const imageFile = formData.get('printImageUrl') as File;

        if (imageFile && imageFile.size > 0) {
            try {
                printImageUrl = await uploadImage(imageFile);
            } catch (e: any) {
                console.error('User image upload failed', e);
                return { success: false, error: `Failed to upload custom image: ${e.message}` };
            }
        }

        const config: CakeConfig = {
            shape: shape as any,
            flavor: flavor as any,
            color: color as any,
            design: design as any,
            weight: weight as any,
            eggType: eggType as any,
            message,
            notes,
            printImageUrl: printImageUrl
        };

        console.log('Creating Order with Config:', JSON.stringify(config, null, 2));

        // Server-side validation for Delivery Date & Time
        const orderDate = new Date(deliveryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        orderDate.setHours(0, 0, 0, 0);

        const diffTime = orderDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0 || diffDays > 6) {
            return {
                success: false,
                error: 'You can place orders only up to 7 days in advance.'
            };
        }

        if (diffDays === 0) {
            // Check for 2-hour buffer
            const now = new Date();
            const [hours, minutes] = deliveryTime.split(':').map(Number);
            const selectedTime = new Date();
            selectedTime.setHours(hours, minutes, 0, 0);

            // Create a buffer time (now + 2 hours)
            const bufferTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

            if (selectedTime < bufferTime) {
                return {
                    success: false,
                    error: 'Same-day orders require at least 2 hours preparation time.'
                };
            }
        }

        // Create the order
        const order = await Order.create({
            userId: (session.user as any).id,
            cakeId: targetCakeId,
            customizationSnapshot: config,
            contactDetails: {
                name: formData.get('contact_name'),
                phone: formData.get('contact_phone')
            },
            deliveryAddress: deliveryAddressObj,
            deliveryDate,
            deliveryTime,
            finalPrice: calculatePrice(config) + (printImageUrl ? 5 : 0) + 40, // Base + Image + Delivery
            status: 'PLACED'
        });

        return { success: true, orderId: order._id.toString() };
    } catch (error) {
        console.error('Failed to create order:', error);
        return { success: false, error: 'Failed to create order' };
    }
}
