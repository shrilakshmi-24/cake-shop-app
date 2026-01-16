'use server';

import dbConnect from '@/lib/db/connect';
import Review from '@/lib/db/models/Review';
import Order from '@/lib/db/models/Order';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function submitReview(orderId: string, rating: number, message: string) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return { success: false, error: 'Authentication required' };
        }

        if (rating < 1 || rating > 5) {
            return { success: false, error: 'Rating must be between 1 and 5' };
        }

        await dbConnect();

        // Verify Order
        const order = await Order.findOne({
            _id: orderId,
            userId: (session.user as any).id
        });

        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        if (order.status !== 'DELIVERED') {
            return { success: false, error: 'You can only review delivered orders' };
        }

        // Check for existing review
        const existingReview = await Review.findOne({ orderId });
        if (existingReview) {
            return { success: false, error: 'You have already reviewed this order' };
        }

        // Create Review
        await Review.create({
            userId: (session.user as any).id,
            userName: session.user.name || 'Anonymous',
            cakeId: order.cakeId,
            orderId: order._id,
            rating,
            message
        });

        // Revalidate relevant paths
        revalidatePath(`/customization/${order.cakeId}`);
        revalidatePath('/orders');

        return { success: true };
    } catch (error) {
        console.error('Submit review error:', error);
        return { success: false, error: 'Failed to submit review' };
    }
}

export async function getCakeReviews(cakeId: string) {
    await dbConnect();
    const reviews = await Review.find({ cakeId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(reviews));
}
