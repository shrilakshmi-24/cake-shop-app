import Link from 'next/link';
import { Carousel } from '@/components/ui/Carousel';
import { calculatePrice } from '@/lib/utils/pricing';
import { CakeConfig } from '@/lib/types/customization';

interface ProductGridProps {
    cakes: any[];
    basePath?: string; // e.g., "" for root, "/outlet-slug" for outlet
}

export default function ProductGrid({ cakes, basePath = "" }: ProductGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Special "Design Your Own" Card */}
            {/* Link needs to be updated if we support outlet-specific customization, for now it goes to root */}
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
                // If basePath is provided, we might want to link to outlet-specific product page if it exists
                // For now, let's assume we link to root products unless we implement outlet product pages
                // But wait, the goal is multi-tenancy.
                // If I click, I go to /products/123.
                // If I want to stay in outlet, I need /outlet-slug/products/123.

                // For now, I'll use the root product page but maybe pass outlet via query param?
                // ?outlet=slug
                const finalLink = basePath
                    ? `${basePath}/products/${cake._id}`
                    : `/products/${cake._id}`;

                // Calculate Display Price to match Product Page
                const defaultConfig: CakeConfig = {
                    shape: cake.allowedShapes[0] || 'round',
                    flavor: cake.allowedFlavors[0] || 'vanilla',
                    color: cake.allowedColors[0] || 'pastel_yellow',
                    design: cake.allowedDesigns[0] || 'classic',
                    weight: '0.5 kg',
                    eggType: 'eggless',
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
                                href={finalLink}
                                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-semibold text-sm shadow-md shadow-rose-100 hover:bg-rose-700 transition-all hover:-translate-y-0.5"
                            >
                                Order as is
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
