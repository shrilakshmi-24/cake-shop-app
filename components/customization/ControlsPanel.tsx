import {
    CakeConfig,
    SHAPES,
    FLAVORS,
    COLORS,
    DESIGNS,
    WEIGHTS,
    EGG_OPTIONS
} from '@/lib/types/customization';
import { useRouter } from 'next/navigation';
import { calculatePrice, PRICES } from '@/lib/utils/pricing';
import { useState } from 'react';
import { useOrder } from '@/contexts/OrderContext';

interface ControlsPanelProps {
    config: CakeConfig;
    cakeId?: string;
    basePrice?: number;
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

// Icons
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

export function ControlsPanel({ config, cakeId, basePrice, allowedOptions, imageFile, setImageFile, dynamicOptions, onConfigChange }: ControlsPanelProps) {
    const router = useRouter();
    const { setConfig: setContextConfig, setImageFile: setContextImageFile, setCakeId, setOrderType, setBasePrice } = useOrder();

    // Local state for optional fields before they are committed to config
    const [message, setMessage] = useState(config.message || '');
    const [notes, setNotes] = useState(config.notes || '');

    const price = calculatePrice(config, basePrice);

    // Dynamic Filtering Logic
    const baseShapes = dynamicOptions?.shapes && dynamicOptions.shapes.length > 0 ? dynamicOptions.shapes : SHAPES;
    const baseDesigns = dynamicOptions?.toppings && dynamicOptions.toppings.length > 0 ? dynamicOptions.toppings : DESIGNS;

    const safeFilter = (base: readonly string[] | string[], allowed?: string[]) => {
        if (!allowed || allowed.length === 0) return base;
        const intersection = base.filter(item => allowed.includes(item));
        return intersection.length > 0 ? intersection : base;
    };

    const availableShapes = safeFilter(baseShapes, allowedOptions?.shapes);
    const availableFlavors = safeFilter(FLAVORS, allowedOptions?.flavors);
    const availableColors = safeFilter(COLORS, allowedOptions?.colors);
    const availableDesigns = safeFilter(baseDesigns, allowedOptions?.designs);

    const handleNext = () => {
        // Save current state to Context
        const finalConfig = { ...config, message, notes };
        setContextConfig(finalConfig);
        setContextImageFile(imageFile);
        setCakeId(cakeId);
        setOrderType('CUSTOMIZED_CAKE');
        if (basePrice) {
            setBasePrice(basePrice);
        }

        // Navigate to Checkout
        router.push('/checkout');
    };

    const updateConfig = (key: keyof CakeConfig, value: string) => {
        const newConfig = { ...config, [key]: value };
        if (onConfigChange) {
            onConfigChange(newConfig);
        } else {
            // Fallback for logic where onConfigChange isn't passed (if any)
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
                    {availableShapes.map(s => {
                        const extraPrice = PRICES.shape[s as keyof typeof PRICES.shape] || 0;
                        return (
                            <button
                                key={s}
                                onClick={() => updateConfig('shape', s)}
                                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${s === config.shape
                                    ? 'bg-rose-500 text-white shadow-lg scale-105'
                                    : 'bg-white border border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                                    }`}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {ShapeIcons[s] || ShapeIcons.round}
                                </svg>
                                <span className="capitalize font-medium text-xs">{s.replace('_', ' ')}</span>
                                {extraPrice > 0 && (
                                    <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s === config.shape ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>
                                        +₹{extraPrice}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Flavor Selection */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">2. Select Flavor</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableFlavors.map(f => {
                        const extraPrice = PRICES.flavor[f as keyof typeof PRICES.flavor] || 0;
                        return (
                            <button
                                key={f}
                                onClick={() => updateConfig('flavor', f)}
                                className={`relative p-4 rounded-xl flex items-center gap-4 text-left transition-all duration-200 border ${f === config.flavor
                                    ? `${FlavorMeta[f].bg} border-rose-500/10 ring-1 ring-rose-500 shadow-sm`
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
                                {extraPrice > 0 && (
                                    <span className="absolute top-4 right-4 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                        +₹{extraPrice}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Weight Selection (Weights are multipliers, handled differently usually, but let's leave as is if user only asked for extras on tiles) */}
            {/* ... Weight Section ... */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">3. Select Weight</h3>
                <div className="grid grid-cols-4 gap-3">
                    {WEIGHTS.map(w => (
                        <button
                            key={w}
                            onClick={() => updateConfig('weight', w)}
                            className={`py-3 rounded-xl border flex items-center justify-center font-medium text-sm transition-all duration-200 ${w === config.weight
                                ? 'bg-rose-500 text-white border-rose-500 shadow-lg scale-105'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                                }`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </section>

            {/* Egg Preference */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">4. Egg Preference</h3>
                <div className="flex gap-4">
                    {EGG_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            onClick={() => updateConfig('eggType', opt)}
                            className={`flex-1 py-3 px-6 rounded-xl border font-bold text-sm uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${opt === config.eggType
                                ? (opt === 'egg' ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-500' : 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500')
                                : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                                }`}
                        >
                            <span className={`w-3 h-3 rounded-full ${opt === 'egg' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            {opt}
                        </button>
                    ))}
                </div>
            </section>

            {/* Color Selection */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">5. Palette</h3>
                <div className="flex flex-wrap gap-4">
                    {availableColors.map(c => {
                        const extraPrice = PRICES.color[c as keyof typeof PRICES.color] || 0;
                        return (
                            <button
                                key={c}
                                onClick={() => updateConfig('color', c)}
                                aria-label={`Select color ${c.replace('pastel_', '')}`}
                                className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${c === config.color
                                    ? 'ring-2 ring-offset-2 ring-rose-500 scale-110'
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
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-500 bg-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-100">
                                    {c.replace('pastel_', '')}
                                    {extraPrice > 0 && <span className="text-rose-600 ml-1">+₹{extraPrice}</span>}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Design Selection */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">6. Design Style</h3>
                <div className="relative">
                    <select
                        value={config.design}
                        onChange={(e) => updateConfig('design', e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-4 pr-10 shadow-sm cursor-pointer hover:border-gray-300 transition-colors capitalize font-medium"
                    >
                        {availableDesigns.map((d) => {
                            const extraPrice = PRICES.design[d as keyof typeof PRICES.design] || 0;
                            return (
                                <option key={d} value={d} className="capitalize py-2">
                                    {d.replace('_', ' ')} {extraPrice > 0 ? `(+₹${extraPrice})` : ''}
                                </option>
                            );
                        })}
                    </select>
                    {/* Custom Arrow Icon */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                    Choose a topping style. We'll customize implementation based on the shape.
                </p>
            </section>

            {/* Message On Cake Area */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">7. Message (Optional)</h3>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message on cake (e.g. Happy Birthday)"
                    maxLength={30}
                    className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400 mb-2"
                />
                <p className="text-xs text-gray-400 pl-1">Will be written on the cake board or top. Max 30 chars.</p>
            </section>

            {/* Print Image Upload */}
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
                            <p className="text-xs text-rose-600 font-semibold mb-2">+₹5.00</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Additional Guide (Notes) */}
            <section className="bg-gray-50 rounded-2xl p-1 mb-8">
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
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all resize-none placeholder:text-gray-400"
                        />
                    </div>
                </details>
            </section>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 right-0 w-full lg:w-1/2 p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
                <div className="flex items-center justify-between max-w-xl mx-auto lg:mr-auto lg:ml-0">
                    {/* Subtotal Display */}
                    <div className="flex flex-col leading-tight">
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Subtotal</span>
                        <span className="text-2xl font-bold text-gray-900 font-mono">₹{price.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleNext}
                        className="px-10 py-4 bg-rose-500 text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-rose-600 transition-all shadow-xl hover:shadow-2xl transform active:scale-95 flex items-center gap-2 shadow-rose-200"
                    >
                        Next: Delivery &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
}
