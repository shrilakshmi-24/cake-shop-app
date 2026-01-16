import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';
import { notFound } from 'next/navigation';
import { ProductPageClient } from '@/components/products/ProductPageClient';
import { getCakeReviews } from '@/lib/actions/review';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await dbConnect();

    // Fetch Cake
    let cake = null;
    try {
        cake = await Cake.findById(id).lean();
    } catch (e) {
        return notFound();
    }

    if (!cake) return notFound();

    // Serialize
    const serializedCake = {
        ...cake,
        _id: cake._id.toString(),
        createdAt: cake.createdAt?.toISOString(),
        updatedAt: cake.updatedAt?.toISOString()
    };

    // Fetch Reviews
    const reviews = await getCakeReviews(id);

    return (
        <ProductPageClient
            cake={serializedCake}
            reviews={reviews}
        />
    );
}
