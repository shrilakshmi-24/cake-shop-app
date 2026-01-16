import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';
import Link from 'next/link';
import { Carousel } from '@/components/ui/Carousel';

import { unstable_cache } from 'next/cache';

// Ensure data is fresh
// Revalidate every hour
export const revalidate = 3600;

const getCakes = unstable_cache(
  async () => {
    await dbConnect();
    // Serialize to plain JSON objects to satisfy caching requirements
    const cakes = await Cake.find({ isActive: true }).lean();
    return JSON.parse(JSON.stringify(cakes));
  },
  ['active-cakes'],
  { revalidate: 3600, tags: ['cakes'] }
);

export default async function Home() {
  const cakes = await getCakes();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Handcrafted Custom Cakes
          </h2>
          <p className="text-lg text-gray-500">
            Choose a base style below and customize it to perfection. Freshly baked, designed by you.
          </p>
        </div>

        {/* Cake Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cakes.map((cake: any) => {
            // Determine defaults for the link
            const defaultShape = cake.allowedShapes?.[0] || 'round';
            const defaultFlavor = cake.allowedFlavors?.[0] || 'vanilla';
            const defaultColor = cake.allowedColors?.[0] || 'white';
            const defaultDesign = cake.allowedDesigns?.[0] || 'classic';

            const customizationLink = `/customization/${cake._id}/${defaultShape}/${defaultFlavor}/${defaultColor}/${defaultDesign}`;

            return (
              <div key={cake._id.toString()} className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center">
                {/* Visual Placeholder */}
                <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl mb-6 relative overflow-hidden group-hover:shadow-md transition-all">
                  <Carousel images={cake.images || []} />
                  {/* Badge if needed */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm border border-gray-100 z-10">
                    Base: ₹{cake.basePrice}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{cake.name}</h3>
                <p className="text-sm text-gray-500 mb-6 px-4">
                  {cake.allowedShapes.length} Shapes • {cake.allowedFlavors.length} Flavors
                </p>

                <Link
                  href={customizationLink}
                  className="w-full block py-4 rounded-xl bg-gray-900 text-white font-semibold shadow-lg shadow-gray-200 hover:bg-red-600 hover:shadow-red-200 transition-all duration-300 transform group-hover:-translate-y-1"
                >
                  Customize &rarr;
                </Link>
              </div>
            );
          })}
        </div>

        {cakes.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-medium text-gray-900">No cakes available right now.</h3>
            <p className="mt-2 text-gray-500">Please check back later or log in as admin to add products.</p>
          </div>
        )}
      </div>

    </main>
  );
}
