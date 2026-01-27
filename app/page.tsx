import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';
import Link from 'next/link';
import { Carousel } from '@/components/ui/Carousel';
import Review from '@/lib/db/models/Review';
import { unstable_cache } from 'next/cache';
import { calculatePrice } from '@/lib/utils/pricing';
import { CakeConfig } from '@/lib/types/customization';

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

export default async function Home() {
  const cakes = await getCakes();

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
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Our Signature Cakes</h2>
          <Link href="/customization" className="text-sm font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1">
            Customize any design &rarr;
          </Link>
        </div>

        {/* Cake Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Special "Design Your Own" Card inserted first */}
          <Link href="/customization" className="group rounded-3xl p-8 bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-100 flex flex-col justify-between shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-40 rounded-full -mr-16 -mt-16 transform group-hover:scale-150 transition-transform duration-700"></div>
            <div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">Start from Scratch</h3>
              <p className="text-gray-600 text-lg">
                Full control over Shape, Flavor, Color, and Toppings.
              </p>
            </div>
            <div className="mt-8">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full text-rose-600 shadow-sm group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </div>
          </Link>

          {cakes.map((cake: any) => {
            // Updated link to Product Page
            const productLink = `/products/${cake._id}`;

            // Calculate Display Price to match Product Page
            const defaultConfig: CakeConfig = {
              shape: cake.allowedShapes[0] || 'round',
              flavor: cake.allowedFlavors[0] || 'vanilla',
              color: cake.allowedColors[0] || 'pastel_yellow',
              design: cake.allowedDesigns[0] || 'classic',
              weight: '0.5 kg', // Default weight
              eggType: 'eggless', // Default preference (usually safe default or should match product page default)
              message: '',
              notes: ''
            };
            const displayPrice = calculatePrice(defaultConfig, cake.basePrice);

            return (
              <div key={cake._id.toString()} className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col items-center text-center">
                {/* Visual Placeholder */}
                <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl mb-6 relative overflow-hidden group-hover:shadow-md transition-all">
                  <Carousel images={cake.images || []} />
                  {/* Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm border border-gray-100 z-10">
                    ₹{displayPrice.toFixed(2)}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{cake.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {cake.rating ? (
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                      <span className="text-yellow-500 text-xs">★</span>
                      <span className="text-xs font-bold text-yellow-700">{cake.rating.avg}</span>
                      <span className="text-xs text-yellow-600">({cake.rating.count})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No ratings yet</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-6 px-4">
                  {cake.allowedFlavors.slice(0, 3).map((f: string) => f.replace('_', ' ')).join(', ')}...
                </p>

                <div className="w-full flex gap-3">
                  <Link
                    href={productLink}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-semibold text-sm shadow-md shadow-rose-100 hover:bg-rose-700 transition-all hover:-translate-y-0.5"
                  >
                    Order as is
                  </Link>
                  {/* <Link
                    href={`/customization/${cake._id}/round/vanilla/white/classic`} // Deep link to customization with this cake as base
                    className="py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-900 hover:text-gray-900 transition-colors"
                  >
                    Customize
                  </Link> */}
                </div>
              </div>
            );
          })}
        </div>

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
