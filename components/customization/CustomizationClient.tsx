'use client';

import { useState } from 'react';
import { CakeConfig } from '@/lib/types/customization';
import { CakePreview } from './CakePreview';
import { ControlsPanel } from './ControlsPanel';
import { ReviewsList } from '../reviews/ReviewsList';

interface CustomizationClientProps {
    config: CakeConfig;
    cakeId?: string;
    fetchedCake?: any;
    availableShapes: string[];
    availableToppings: string[];
    reviews?: any[];
}

export function CustomizationClient({ config: initialConfig, cakeId, fetchedCake, availableShapes, availableToppings, reviews = [] }: CustomizationClientProps) {
    // 1. Maintain Config State Locally to prevent full page reloads/remounts
    const [config, setConfig] = useState<CakeConfig>(initialConfig);

    // 2. Maintain Image State Locally (now safe from remounts)
    const [imageFile, setImageFile] = useState<File | null>(null);

    // 3. Helper to update config and URL softly
    const handleConfigChange = (newConfig: CakeConfig) => {
        setConfig(newConfig);
        // Soft URL update for shareability/history without triggering Server Action/Remount
        const url = cakeId
            ? `/customization/${cakeId}/${newConfig.shape}/${newConfig.flavor}/${newConfig.color}/${newConfig.design}`
            : `/customization/${newConfig.shape}/${newConfig.flavor}/${newConfig.color}/${newConfig.design}`;
        window.history.replaceState({ ...window.history.state, as: url, url: url }, '', url);
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">
            {/* 
            LEFT COLUMN: PREVIEW
            */}
            <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-8 lg:h-screen lg:sticky lg:top-0 border-r border-gray-100">
                <div className="w-full max-w-lg">
                    <CakePreview config={config} printImageFile={imageFile} />
                </div>
            </div>

            {/* 
            RIGHT COLUMN: CONTROLS
            */}
            <div className="w-full lg:w-1/2 bg-white p-6 lg:p-16 xl:p-24 flex flex-col">
                <div className="max-w-xl mx-auto w-full">
                    <div className="mb-10 text-center lg:text-left">
                        <span className="inline-block py-1 px-3 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wide uppercase mb-3">
                            {fetchedCake ? 'Custom Order' : 'Build Your Own'}
                        </span>
                        <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
                            {fetchedCake ? fetchedCake.name : 'Build Your Cake'}
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Customize your perfect cake.
                            {fetchedCake && <span className="block mt-1 text-sm text-gray-400">Base Price: ₹{fetchedCake.basePrice}</span>}
                        </p>
                    </div>

                    <ControlsPanel
                        config={config}
                        cakeId={cakeId}
                        basePrice={fetchedCake?.basePrice} // Pass basePrice
                        allowedOptions={fetchedCake ? {
                            shapes: fetchedCake.allowedShapes,
                            flavors: fetchedCake.allowedFlavors,
                            colors: fetchedCake.allowedColors,
                            designs: fetchedCake.allowedDesigns
                        } : undefined}
                        dynamicOptions={{
                            shapes: availableShapes,
                            toppings: availableToppings
                        }}
                        imageFile={imageFile}
                        setImageFile={setImageFile}
                        onConfigChange={handleConfigChange}
                    />

                    {/* Reviews Section */}
                    {cakeId && <ReviewsList reviews={reviews} />}
                </div>
            </div>
        </div>
    );
}
