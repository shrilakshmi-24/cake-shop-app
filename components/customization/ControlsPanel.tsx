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
    dynamicOptions?: {
        shapes: string[];
        toppings: string[];
    };
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    onConfigChange?: (newConfig: CakeConfig) => void;
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

export function ControlsPanel({ config, cakeId, allowedOptions, imageFile, setImageFile, dynamicOptions, onConfigChange }: ControlsPanelProps) {
    const router = useRouter(); // Still needed for order push
    const [isOrdering, setIsOrdering] = useState(false);
    // const [imageFile, setImageFile] = useState<File | null>(null); // Lifted up
    const [message, setMessage] = useState(config.message || '');
    const [notes, setNotes] = useState(config.notes || '');

    const price = calculatePrice(config);

    // Dynamic Filtering Logic
    // Source of truth: Filesystem (dynamicOptions) > Constants (SHAPES/DESIGNS)
    const baseShapes = dynamicOptions?.shapes && dynamicOptions.shapes.length > 0 ? dynamicOptions.shapes : SHAPES;
    const baseDesigns = dynamicOptions?.toppings && dynamicOptions.toppings.length > 0 ? dynamicOptions.toppings : DESIGNS;

    // Helper to safely filter or fallback
    // If strict compliance with DB restrictions (allowedOptions) yields NOTHING (e.g. caused by legacy data mismatch), 
    // fallback to showing all available physical options.
    const safeFilter = (base: readonly string[] | string[], allowed?: string[]) => {
        if (!allowed || allowed.length === 0) return base;
        const intersection = base.filter(item => allowed.includes(item));
        return intersection.length > 0 ? intersection : base;
    };

    const availableShapes = safeFilter(baseShapes, allowedOptions?.shapes);
    const availableFlavors = safeFilter(FLAVORS, allowedOptions?.flavors);

    // For Colors, since we completely replaced the system to 4 Pastel Colors, 
    // we should likely ignore legacy DB colors (like 'white', 'red') entirely if they don't match.
    const availableColors = safeFilter(COLORS, allowedOptions?.colors);

    const availableDesigns = safeFilter(baseDesigns, allowedOptions?.designs);

    const handleOrder = async () => {
        setIsOrdering(true);
        try {
            const formData = new FormData();
            formData.append('shape', config.shape);
            formData.append('flavor', config.flavor);
            formData.append('color', config.color);
            formData.append('design', config.design);
            formData.append('message', message);
            formData.append('notes', notes);
            formData.append('price', price.toString());

            if (cakeId) {
                formData.append('cakeId', cakeId);
            }

            if (imageFile) {
                // Debug log to confirm file presence
                console.log('Attaching image file to order:', imageFile.name, imageFile.size);
                formData.append('printImageUrl', imageFile);
            } else {
                console.warn('No image file selected');
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
        if (onConfigChange) {
            onConfigChange(newConfig);
        } else {
            // Fallback for legacy behavior
            const url = cakeId
                ? `/customization/${cakeId}/${newConfig.shape}/${newConfig.flavor}/${newConfig.color}/${newConfig.design}`
                : `/customization/${newConfig.shape}/${newConfig.flavor}/${newConfig.color}/${newConfig.design}`;
            router.push(url);
        }
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
                                style={{
                                    backgroundColor: c.replace('pastel_', 'var(--color-)')
                                }}
                            >
                                <div className="w-full h-full rounded-full" style={{
                                    backgroundColor:
                                        c === 'pastel_red' ? '#fca5a5' :
                                            c === 'pastel_blue' ? '#93c5fd' :
                                                c === 'pastel_yellow' ? '#fde68a' :
                                                    c === 'pastel_green' ? '#86efac' : '#eee'
                                }}></div>
                            </div>
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-400 capitalize opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {c.replace('pastel_', '')}
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
                            {/* Visual Hint for Design - Try and load the image if possible? Or just text */}
                            <span className="capitalize text-sm z-10">{d.replace('_', ' ')}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Message On Cake Area */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">5. Message (Optional)</h3>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message on cake (e.g. Happy Birthday)"
                    maxLength={30}
                    className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400 mb-2"
                />
                <p className="text-xs text-gray-400 pl-1">Will be written on the cake board or top. Max 30 chars.</p>
            </section>

            {/* Print Image Upload (Mockup Style) */}
            <section>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-gray-300 transition-colors group relative bg-gray-50/50">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />

                    {imageFile ? (
                        <div className="flex flex-col items-center z-10">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span className="font-medium text-gray-900">{imageFile.name}</span>
                            <span className="text-xs text-gray-400 mt-1">Click to replace</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center z-10">
                            <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-white">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">Upload something to print 🎂</h4>
                            <p className="text-xs text-pink-600 font-semibold mb-2">+₹5.00</p>
                            {/* Assuming +$5 based on mockup +45 visual cue */}
                        </div>
                    )}
                </div>
                {!imageFile && (
                    <p className="text-xs text-gray-400 mt-3 text-center">
                        We will make sure to place it in the right position on the cake
                    </p>
                )}
            </section>

            {/* Additional Guide (Notes) */}
            <section className="bg-gray-50 rounded-2xl p-1">
                <details className="group" open>
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                        <div className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            <span className="font-semibold text-sm text-gray-900">Additional Guide (Notes)</span>
                        </div>
                        <span className="group-open:rotate-180 transition-transform">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </span>
                    </summary>
                    <div className="p-4 pt-0">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Example: write instructions, allergies, etc."
                            rows={2}
                            maxLength={100}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all resize-none placeholder:text-gray-400"
                        />
                    </div>
                </details>
            </section>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 right-0 w-full lg:w-1/2 p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
                <div className="flex items-center justify-between max-w-xl mx-auto lg:mr-auto lg:ml-0">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total</span>
                        <span className="text-3xl font-bold text-gray-900 font-mono">₹{price.toFixed(2)}</span>
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
