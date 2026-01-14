import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';
import { CakePreview } from '@/components/customization/CakePreview';
import { ControlsPanel } from '@/components/customization/ControlsPanel';
import {
    CakeConfig,
    CakeShape,
    CakeFlavor,
    CakeColor,
    CakeDesign,
    isValidConfig
} from '@/lib/types/customization';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CustomizationPage({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;

    // Default Config
    let config: CakeConfig = {
        shape: 'round',
        flavor: 'vanilla',
        color: 'white',
        design: 'classic',
        message: ''
    };

    let cakeId = '';
    let fetchedCake = null;

    // Check for 5 segments: [id, shape, flavor, color, design]
    if (slug && slug.length >= 5) {
        const [id, shape, flavor, color, design] = slug;
        cakeId = id;
        if (isValidConfig(shape, flavor, color, design)) {
            config = {
                shape: shape as CakeShape,
                flavor: flavor as CakeFlavor,
                color: color as CakeColor,
                design: design as CakeDesign,
                message: ''
            };
        }
    } else if (slug && slug.length === 4) {
        // Legacy/Fallback support
        const [shape, flavor, color, design] = slug;
        if (isValidConfig(shape, flavor, color, design)) {
            config = {
                shape: shape as CakeShape,
                flavor: flavor as CakeFlavor,
                color: color as CakeColor,
                design: design as CakeDesign,
                message: ''
            };
        }
    } else if (slug && slug.length === 1) {
        // Just the ID - Fetch defaults
        cakeId = slug[0];
    }

    // Fetch Cake if ID exists
    if (cakeId) {
        await dbConnect();
        try {
            fetchedCake = await Cake.findById(cakeId).lean();
            // If we have just an ID (length 1), apply defaults from DB
            if (fetchedCake && slug.length === 1) {
                config = {
                    shape: (fetchedCake.allowedShapes[0] || 'round') as CakeShape,
                    flavor: (fetchedCake.allowedFlavors[0] || 'vanilla') as CakeFlavor,
                    color: (fetchedCake.allowedColors[0] || 'white') as CakeColor,
                    design: (fetchedCake.allowedDesigns[0] || 'classic') as CakeDesign,
                    message: ''
                };
            }
        } catch (e) { }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">
            {/* 
            LEFT COLUMN: PREVIEW
            */}
            <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-8 lg:h-screen lg:sticky lg:top-0 border-r border-gray-100">
                <div className="w-full max-w-lg">
                    <CakePreview config={config} />
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
                            {fetchedCake && <span className="block mt-1 text-sm text-gray-400">Base Price: ${fetchedCake.basePrice}</span>}
                        </p>
                    </div>

                    <ControlsPanel
                        config={config}
                        cakeId={cakeId}
                        allowedOptions={fetchedCake ? {
                            shapes: fetchedCake.allowedShapes,
                            flavors: fetchedCake.allowedFlavors,
                            colors: fetchedCake.allowedColors,
                            designs: fetchedCake.allowedDesigns
                        } : undefined}
                    />
                </div>
            </div>
        </div>
    );
}
