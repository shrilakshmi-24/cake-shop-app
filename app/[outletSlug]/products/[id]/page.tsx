import ProductPage from '@/app/products/[id]/page';

export default async function OutletProductPage({ params }: { params: Promise<{ outletSlug: string; id: string }> }) {
    const { id } = await params;
    // Pass the ID to the original ProductPage by creating a promise for its expected params
    return <ProductPage params={Promise.resolve({ id })} />;
}
