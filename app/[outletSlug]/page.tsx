import { notFound } from 'next/navigation';
import Outlet from '@/lib/db/models/Outlet';
import ProductGrid from '@/components/products/ProductGrid';
import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';

// NOTE: This is a server component.

async function getOutletProducts(outletId: string) {
    await dbConnect();
    // Show all active cakes as default products for the outlet
    return Cake.find({
        isActive: true
    }).sort({ createdAt: -1 }).lean();
}

export default async function OutletPage({ params }: { params: Promise<{ outletSlug: string }> }) {
    const { outletSlug } = await params;
    await dbConnect();
    const outlet = await Outlet.findOne({ slug: outletSlug }).select('_id name').lean();

    if (!outlet) notFound();

    const products = await getOutletProducts(outlet._id.toString());
    const plainProducts = JSON.parse(JSON.stringify(products));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to {outlet.name}</h1>

            <ProductGrid cakes={plainProducts} basePath={`/${outletSlug}`} />

            {plainProducts.length === 0 && (
                <p className="text-center text-gray-500 py-12">No products available at this outlet yet.</p>
            )}
        </div>
    );
}
