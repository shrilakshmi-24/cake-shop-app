'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/contexts/OrderContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { CakeConfig, WEIGHTS, EGG_OPTIONS } from '@/lib/types/customization';
import { calculatePrice } from '@/lib/utils/pricing';
import { Carousel } from '@/components/ui/Carousel';
import { ReviewsList } from '@/components/reviews/ReviewsList';

interface ProductPageClientProps {
    cake: any;
    reviews: any[];
}

export function ProductPageClient({ cake, reviews }: ProductPageClientProps) {
    const router = useRouter();
    const { setConfig, setCakeId, setOrderType, setBasePrice } = useOrder();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    // Local State for Simplified Options
    // Explicitly type weight as CakeWeight
    const [weight, setWeight] = useState<typeof WEIGHTS[number]>('0.5 kg');
    const [eggType, setEggType] = useState('eggless');
    const [message, setMessage] = useState('');
    const [notes, setNotes] = useState('');

    // Derived Config for Pricing & Actions
    // We use memoization or just simple derivation on render since it's cheap
    const config: CakeConfig = {
        shape: cake.allowedShapes[0] || 'round',
        flavor: cake.allowedFlavors[0] || 'vanilla',
        color: cake.allowedColors[0] || 'pastel_yellow',
        design: cake.allowedDesigns[0] || 'classic',
        weight: weight,
        eggType: eggType as 'egg' | 'eggless',
        message: message,
        notes: notes
    };

    // Calculate Price using shared utility
    const price = calculatePrice(config, cake.basePrice);

    const handleAddToCart = () => {
        addToCart({
            config,
            cakeId: cake._id,
            basePrice: cake.basePrice,
            quantity: 1,
            name: cake.name,
            orderType: 'EXISTING_CAKE'
        });
        showToast('Added to cart!', 'success');
    };

    const handleBuyNow = () => {
        setConfig(config);
        setCakeId(cake._id);
        setOrderType('EXISTING_CAKE');
        setBasePrice(cake.basePrice); // Set context base price

        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col lg:flex-row">

                    {/* Left: Image Carousel */}
                    <div className="w-full lg:w-1/2 bg-gray-100 p-8 flex flex-col justify-center">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm relative">
                            <Carousel images={cake.images || []} />
                        </div>
                    </div>

                    {/* Right: Details & Inputs */}
                    <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
                        <div className="mb-8">
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">{cake.name}</h1>
                            {/* Rating Badge */}
                            {cake.rating && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                        <span className="text-yellow-500 text-xs">★</span>
                                        <span className="text-xs font-bold text-yellow-700">{cake.rating.avg}</span>
                                        <span className="text-xs text-yellow-600">({cake.rating.count})</span>
                                    </div>
                                </div>
                            )}
                            <p className="text-gray-500 text-lg leading-relaxed">{cake.description || "A delicious handcrafted cake for your special occasions."}</p>
                        </div>

                        <div className="space-y-8 flex-1">
                            {/* Weight */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Weight</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {WEIGHTS.map(w => (
                                        <button
                                            key={w}
                                            onClick={() => setWeight(w)}
                                            className={`py-3 rounded-xl border text-sm font-medium transition-all ${w === weight
                                                ? 'bg-rose-500 text-white border-rose-500 shadow-md transform scale-105'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Egg Preference */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Preference</label>
                                <div className="flex gap-4">
                                    {EGG_OPTIONS.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setEggType(opt)}
                                            className={`flex-1 py-3 px-6 rounded-xl border font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${opt === eggType
                                                ? (opt === 'egg' ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-500' : 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500')
                                                : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className={`w-3 h-3 rounded-full ${opt === 'egg' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message & Notes */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message on Cake (Optional)</label>
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Happy Birthday..."
                                        maxLength={30}
                                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-rose-500 focus:border-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Baker Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Allergies, instructions..."
                                        rows={2}
                                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-rose-500 focus:border-rose-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Price</span>
                                <span className="text-3xl font-mono font-bold text-gray-900">₹{price.toFixed(2)}</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    className="px-8 py-4 bg-white text-rose-500 border-2 border-rose-500 rounded-full font-bold uppercase tracking-wider hover:bg-rose-50 transition-all"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="px-8 py-4 bg-rose-500 text-white rounded-full font-bold uppercase tracking-wider shadow-lg hover:bg-rose-600 hover:shadow-xl transition-all transform active:scale-95 shadow-rose-200"
                                >
                                    Order Now &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <ReviewsList reviews={reviews} />
                </div>
            </div>
        </div>
    );
}
