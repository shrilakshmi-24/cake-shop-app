'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/contexts/OrderContext';
import {
    CakeConfig,
    WEIGHTS,
    EGG_OPTIONS,
    FLAVORS,
    CakeFlavor,
    CakeWeight
} from '@/lib/types/customization';
import { WEIGHT_MULTIPLIERS } from '@/lib/utils/pricing';

export function CustomRequestClient() {
    const router = useRouter();
    const { setConfig, setCakeId, setOrderType, setReferenceImageFile, setBasePrice } = useOrder();

    // Local State
    const [image, setImage] = useState<File | null>(null);
    const [weight, setWeight] = useState<CakeWeight>('1 kg'); // Default 1kg for custom requests
    const [flavor, setFlavor] = useState<CakeFlavor>('vanilla');
    const [eggType, setEggType] = useState('eggless');
    const [message, setMessage] = useState('');
    const [notes, setNotes] = useState('');

    // Dynamic Price Estimation (Rough Estimate)
    const basePrice = 500; // Base for 0.5kg custom request as per requirement
    const weightMultiplier = WEIGHTS.includes(weight) ? WEIGHT_MULTIPLIERS[weight] : 1;

    const price = basePrice * weightMultiplier;

    const handleNext = () => {
        if (!image) {
            alert("Please upload a reference image of the cake you want.");
            return;
        }

        // Auto-fill note if empty
        const finalNotes = notes.trim() || "I want this cake which is shown in the uploaded image.";

        const config: CakeConfig = {
            shape: 'round', // Default logic, will be overridden by reference image context usually
            flavor,
            color: 'pastel_yellow', // Default valid color
            design: 'custom', // Custom logic
            weight,
            eggType: eggType as 'egg' | 'eggless',
            message,
            notes: finalNotes
        };

        setConfig(config);
        setCakeId(undefined); // No specific cake ID
        setCakeId(undefined); // No specific cake ID
        setOrderType('IMAGE_REFERENCE_CAKE');
        setReferenceImageFile(image);
        setBasePrice(500); // Explicitly set base price for custom flow

        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-3">
                        Have a design in mind?
                    </h1>
                    <p className="text-lg text-gray-500">
                        Upload a picture and we'll bake it to perfection.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm overflow-hidden p-8 lg:p-12">
                    <div className="space-y-10">

                        {/* 1. Reference Image Upload */}
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">1. Upload Reference Image (Required)</h3>
                            <div className="border-3 border-dashed border-rose-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-rose-50/50 hover:border-rose-200 transition-all group relative bg-gray-50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) setImage(e.target.files[0]);
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                {image ? (
                                    <div className="flex flex-col items-center z-10">
                                        <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-lg mb-4">
                                            <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-bold text-gray-900">{image.name}</span>
                                        <span className="text-xs text-rose-500 font-semibold mt-1">Click to replace</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center z-10 pointer-events-none">
                                        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">Upload Cake Photo</h4>
                                        <p className="text-sm text-gray-500">We'll use this as a reference</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* 2. Weight */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">2. Select Weight</h3>
                                <div className="grid grid-cols-2 gap-3">
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
                            </section>

                            {/* 3. Flavor */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">3. Select Flavor</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {FLAVORS.map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFlavor(f)}
                                            className={`px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all capitalize ${f === flavor
                                                ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            {f.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* 4. Egg Preference */}
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">4. Egg Preference</h3>
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
                        </section>

                        {/* 5. Message & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">5. Message (Optional)</h3>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Happy Birthday..."
                                    maxLength={30}
                                    className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:ring-rose-500 focus:border-rose-500"
                                />
                            </section>
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">6. Any Specifics? (Optional)</h3>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Tell us about the design/colors..."
                                    rows={1}
                                    className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:ring-rose-500 focus:border-rose-500 resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-2">If left blank, we'll assume you want exactly what's in the photo.</p>
                            </section>
                        </div>

                    </div>

                    {/* Footer Action */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-sm text-gray-500 mb-1">Estimated starts from</p>
                            <p className="text-3xl font-mono font-bold text-gray-900">₹{price.toFixed(0)}</p>
                            <p className="text-xs text-gray-400">*Final price may vary based on complexity</p>
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={!image}
                            className={`w-full md:w-auto px-10 py-4 rounded-full font-bold uppercase tracking-wider shadow-lg transition-all transform flex items-center justify-center gap-2 ${image
                                ? 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-xl active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Next: Delivery Details &rarr;
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
