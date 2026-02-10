import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';
import Link from 'next/link';
import { Carousel } from '@/components/ui/Carousel';
import Review from '@/lib/db/models/Review';
import Outlet from '@/lib/db/models/Outlet';
import { unstable_cache } from 'next/cache';
import { calculatePrice } from '@/lib/utils/pricing';
import { CakeConfig } from '@/lib/types/customization';
import ProductGrid from '@/components/products/ProductGrid';
import OutletGrid from '@/components/outlet/OutletGrid';

// Ensure data is fresh
// Revalidate every hour
export const revalidate = 3600;

const getCakes = unstable_cache(
  async () => {
    await dbConnect();
    // Serialize to plain JSON objects to satisfy caching requirements
    const cakes = await Cake.find({ isActive: true }).lean();

    // Aggregation for Average Ratings
    const ratings = await Review.aggregate([
      {
        $group: {
          _id: "$cakeId",
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map for fast lookup
    const ratingsMap = ratings.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = {
        avg: curr.averageRating.toFixed(1),
        count: curr.count
      };
      return acc;
    }, {});

    // Attach rating info to cakes
    const cakesWithRatings = cakes.map((cake: any) => ({
      ...cake,
      rating: ratingsMap[cake._id.toString()] || null
    }));

    return JSON.parse(JSON.stringify(cakesWithRatings));
  },
  ['active-cakes'],
  { revalidate: 3600, tags: ['cakes'] }
);

async function getOutlets() {
  await dbConnect();
  return Outlet.find({ isActive: true }).lean();
}

export default async function Home() {
  const cakes = await getCakes();
  const outlets = await getOutlets();
  const plainOutlets = JSON.parse(JSON.stringify(outlets));

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Handcrafted for Your Special Moments
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            Choose from our signature collection, design your own masterpiece, or send us a picture of what you want.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/customization"
              className="px-8 py-4 bg-rose-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-rose-700 transition-all"
            >
              Design Your Own Cake
            </Link>
            <Link
              href="/custom-request"
              className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold shadow-sm hover:shadow-md hover:border-rose-600 hover:text-rose-600 transition-all flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Upload Reference Photo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Outlet Grid */}
        <OutletGrid outlets={plainOutlets} />

        <div className="flex items-center justify-between mb-10 mt-16">
          <h2 className="text-3xl font-bold text-gray-900">Our Signature Cakes</h2>
          <Link href="/customization" className="text-sm font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1">
            Customize any design &rarr;
          </Link>
        </div>

        {/* Cake Grid */}
        <ProductGrid cakes={cakes} />

        {/* Upload Request Section */}
        <div className="mt-20 bg-gradient-to-br from-gray-50 to-rose-50 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden border border-gray-100">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Have a specific design in mind?</h2>
            <p className="text-gray-600 text-lg mb-8">
              If you found a cake you love on Pinterest or Instagram, just upload the photo. We'll recreate it for you.
            </p>
            <Link
              href="/custom-request"
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-rose-700 transition-all transform hover:-translate-y-0.5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Upload Reference Image
            </Link>
          </div>
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 opacity-20 blur-3xl rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

      </div>

    </main>
  );
}
