'use client';

import {
    CakeConfig,
    SHAPES,
    FLAVORS,
    COLORS,
    DESIGNS
} from '@/lib/types/customization';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/lib/actions/order';
import { calculatePrice } from '@/lib/utils/pricing';
import { useState } from 'react';

interface ControlsPanelProps {
    config: CakeConfig;
    cakeId?: string;
    allowedOptions?: {
        shapes: string[];
        flavors: string[];
        colors: string[];
        designs: string[];
    };
}

// Icons (unchanged)
const ShapeIcons: Record<string, React.ReactNode> = {
    round: <circle cx="12" cy="12" r="10" />,
    square: <rect x="3" y="3" width="18" height="18" rx="2" />,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    mini_heart: <path transform="scale(0.7) translate(5,5)" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
};

const FlavorMeta: Record<string, { desc: string, bg: string }> = {
    vanilla: { desc: 'Classic Madagascan', bg: 'bg-amber-50' },
    chocolate: { desc: 'Rich Belgian Dark', bg: 'bg-stone-100' },
    red_velvet: { desc: 'Cream Cheese Frosting', bg: 'bg-red-50' },
    lemon: { desc: 'Zesty Lemon Curd', bg: 'bg-yellow-50' }
};

export function ControlsPanel({ config, cakeId, allowedOptions }: ControlsPanelProps) {
    const router = useRouter();
    const [isOrdering, setIsOrdering] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [message, setMessage] = useState(config.message || '');

    const price = calculatePrice(config);

    // Filter Options based on Cake Restrictions
    const availableShapes = SHAPES.filter(s => !allowedOptions || allowedOptions.shapes.includes(s));
    const availableFlavors = FLAVORS.filter(f => !allowedOptions || allowedOptions.flavors.includes(f));
    const availableColors = COLORS.filter(c => !allowedOptions || allowedOptions.colors.includes(c));
    const availableDesigns = DESIGNS.filter(d => !allowedOptions || allowedOptions.designs.includes(d));

    const handleOrder = async () => {
        setIsOrdering(true);
        try {
            const formData = new FormData();
            formData.append('shape', config.shape);
            formData.append('flavor', config.flavor);
            formData.append('color', config.color);
            formData.append('design', config.design);
            formData.append('message', message);
            formData.append('price', price.toString());

            if (cakeId) {
                formData.append('cakeId', cakeId);
            }

            if (imageFile) {
                formData.append('customImage', imageFile);
            }

            const result = await createOrder(formData);
            if (result.success) {
                alert(`Order Placed! ID: ${result.orderId}`);
                router.push('/orders');
            } else {
                alert(result.error || 'Failed to place order.');
            }
        } catch (e) {
            console.error(e);
            alert('Error placing order');
        } finally {
            setIsOrdering(false);
        }
    };

    const updateConfig = (key: keyof CakeConfig, value: string) => {
        const newConfig = { ...config, [key]: value };
        // Construct URL: if cakeId exists, include it
        const url = cakeId
            ? `/customization/${cakeId}/${newConfig.shape}/${newConfig.flavor}/${newConfig.color}/${newConfig.design}`
            : `/customization/${newConfig.shape}/${newConfig.flavor}/${newConfig.color}/${newConfig.design}`;
        router.push(url);
    };

    return (
        <div className="space-y-10 pb-32">
            {/* Shape Selection */}
            <section>
                <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">1. Choose Shape</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {availableShapes.map(s => (
                        <button
                            key={s}
                            onClick={() => updateConfig('shape', s)}
                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${s === config.shape
                                ? 'bg-gray-900 text-white shadow-lg scale-105'
                                : 'bg-white border border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                                }`}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {ShapeIcons[s] || ShapeIcons.round}
                            </svg>
                            <span className="capitalize font-medium text-xs">{s.replace('_', ' ')}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Flavor Selection */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">2. Select Flavor</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableFlavors.map(f => (
                        <button
                            key={f}
                            onClick={() => updateConfig('flavor', f)}
                            className={`p-4 rounded-xl flex items-center gap-4 text-left transition-all duration-200 border ${f === config.flavor
                                ? `${FlavorMeta[f].bg} border-gray-900/10 ring-1 ring-gray-900 shadow-sm`
                                : 'bg-white border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${f === config.flavor ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                                {f[0].toUpperCase()}
                            </div>
                            <div>
                                <span className="block font-semibold text-gray-900 capitalize text-sm">{f.replace('_', ' ')}</span>
                                <span className="block text-xs text-gray-500 mt-0.5">{FlavorMeta[f].desc}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Color Selection */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">3. Palette</h3>
                <div className="flex flex-wrap gap-4">
                    {availableColors.map(c => (
                        <button
                            key={c}
                            onClick={() => updateConfig('color', c)}
                            className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${c === config.color
                                ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                                : 'hover:scale-110'
                                }`}
                        >
                            <div
                                className="w-full h-full rounded-full border border-gray-200 shadow-sm"
                                style={{ backgroundColor: c === 'white' ? '#fff' : c }}
                            />
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-400 capitalize opacity-0 group-hover:opacity-100 transition-opacity">
                                {c}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Design Selection */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">4. Design Style</h3>
                <div className="grid grid-cols-2 gap-3">
                    {availableDesigns.map(d => (
                        <button
                            key={d}
                            onClick={() => updateConfig('design', d)}
                            className={`h-20 border rounded-xl flex items-center justify-center transition-all duration-200 relative overflow-hidden ${d === config.design
                                ? 'border-gray-900 bg-gray-50 text-gray-900 font-bold'
                                : 'border-gray-200 hover:border-gray-400 text-gray-600'
                                }`}
                        >
                            {/* Abstract visual hint */}
                            {d === 'drip' && <div className="absolute top-0 left-0 w-full h-2 bg-current opacity-20 rounded-b-xl" />}
                            {d === 'naked' && <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, currentColor 5px, currentColor 10px)' }} />}

                            <span className="capitalize text-sm z-10">{d}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Message Input */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">5. Message (Optional)</h3>
                <div className="relative">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Happy Birthday, Alex!"
                        rows={3}
                        maxLength={50}
                        className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-sm focus:border-gray-900 focus:bg-white focus:ring-gray-900 transition-all resize-none"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {message.length}/50
                    </div>
                </div>
            </section>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 right-0 w-full lg:w-1/2 p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
                <div className="flex items-center justify-between max-w-xl mx-auto lg:mr-auto lg:ml-0">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total</span>
                        <span className="text-3xl font-bold text-gray-900 font-mono">${price.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleOrder}
                        disabled={isOrdering}
                        className="px-10 py-4 bg-gray-900 text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-black transition-all shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 flex items-center gap-2"
                    >
                        {isOrdering ? (
                            <>Processing...</>
                        ) : (
                            <>Add to Cart &rarr;</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
