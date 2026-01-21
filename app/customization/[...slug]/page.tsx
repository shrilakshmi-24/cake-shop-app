import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';
import { CustomizationClient } from '@/components/customization/CustomizationClient';
import {
    CakeConfig,
    CakeShape,
    CakeFlavor,
    CakeColor,
    CakeDesign,
    isValidConfig, // Keeping for other uses, or remove if unused
    SHAPES,
    DESIGNS,
    FLAVORS,
    COLORS
} from '@/lib/types/customization';
import { getAvailableOptions } from '@/lib/assets';
import { redirect } from 'next/navigation';
import { getCakeReviews } from '@/lib/actions/review';

export const dynamic = 'force-dynamic';

import { getOptions, seedOptions } from '@/lib/actions/options';

export default async function CustomizationPage({
    params,
}: {
    // Force rebuild to pick up new assets
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;


    // Fetch dynamic options
    let options = await getOptions();

    // Auto-seed if no options exist (First run optimization)
    if (options.length === 0) {
        await seedOptions();
        options = await getOptions();
    }

    // Dynamic Asset Loading (moved up for defaults)
    // These will be replaced by dbOptions
    const dynamicShapes = getAvailableOptions('shapes');
    const dynamicToppings = getAvailableOptions('toppings');

    // Default Config
    // Use first available option from filesystem or fallback to safe hardcodes
    let config: CakeConfig = {
        shape: (dynamicShapes.length > 0 ? dynamicShapes[0] : 'round') as CakeShape,
        flavor: 'vanilla',
        color: 'pastel_yellow',
        design: (dynamicToppings.length > 0 ? dynamicToppings[0] : 'classic') as CakeDesign, // Fallback to classic only if empty
        weight: '0.5 kg',
        eggType: 'eggless',
        message: ''
    };

    let cakeId = '';
    let fetchedCake = null;
    let existingReview = [];

    // Parse Slug Logic
    if (slug && slug.length >= 5) {
        // [id, shape, flavor, color, design]
        cakeId = slug[0];
        const shape = slug[1];
        const flavor = slug[2];
        const color = slug[3];
        const design = slug[4];

        // Validation logic
        const isShapeValid = dynamicShapes.includes(shape) || SHAPES.includes(shape as any);
        const isDesignValid = dynamicToppings.includes(design) || DESIGNS.includes(design as any);

        if (
            isShapeValid &&
            FLAVORS.includes(flavor as CakeFlavor) &&
            COLORS.includes(color as CakeColor) &&
            isDesignValid
        ) {
            config = {
                shape: shape as CakeShape,
                flavor: flavor as CakeFlavor,
                color: color as CakeColor,
                design: design as CakeDesign,
                weight: '0.5 kg',
                eggType: 'eggless',
                message: ''
            };
        }
    } else if (slug && slug.length === 4) {
        // [shape, flavor, color, design] (No ID)
        const shape = slug[0];
        const flavor = slug[1];
        const color = slug[2];
        const design = slug[3];
        if (isValidConfig(shape, flavor, color, design)) {
            config = {
                shape: shape as CakeShape,
                flavor: flavor as CakeFlavor,
                color: color as CakeColor,
                design: design as CakeDesign,
                weight: '0.5 kg',
                eggType: 'eggless',
                message: ''
            };
        }
    } else if (slug && slug.length === 1) {
        // [id]
        cakeId = slug[0];
    }

    // Fetch Cake Data
    if (cakeId) {
        await dbConnect();
        try {
            fetchedCake = await Cake.findById(cakeId).lean();
            if (fetchedCake) {
                fetchedCake._id = fetchedCake._id.toString(); // Serialize ID

                // If just ID provided, set config from cake defaults
                if (slug.length === 1) {
                    config = {
                        shape: (fetchedCake.allowedShapes[0] || 'round') as CakeShape,
                        flavor: (fetchedCake.allowedFlavors[0] || 'vanilla') as CakeFlavor,
                        color: (fetchedCake.allowedColors[0] || 'pastel_yellow') as CakeColor,
                        design: (fetchedCake.allowedDesigns[0] || 'classic') as CakeDesign,
                        weight: '0.5 kg',
                        eggType: 'eggless',
                        message: ''
                    };
                }

                // FORCE UNLOCK for dynamic options
                if (fetchedCake.allowedDesigns) {
                    fetchedCake.allowedDesigns = [];
                }
            }
            existingReview = await getCakeReviews(cakeId);
        } catch (e) {
            console.error("Error fetching cake:", e);
        }
    }

    return (
        <CustomizationClient
            config={config}
            cakeId={cakeId || undefined}
            fetchedCake={fetchedCake}
            availableShapes={dynamicShapes}
            availableToppings={dynamicToppings}
            reviews={existingReview}
            dbOptions={options}
        />
    );
}
