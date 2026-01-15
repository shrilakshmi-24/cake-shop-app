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

export const dynamic = 'force-dynamic';

export default async function CustomizationPage({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;

    // Dynamic Asset Loading (moved up for defaults)
    const dynamicShapes = getAvailableOptions('shapes');
    const dynamicToppings = getAvailableOptions('toppings');

    // Default Config
    // Use first available option from filesystem or fallback to safe hardcodes
    let config: CakeConfig = {
        shape: (dynamicShapes.length > 0 ? dynamicShapes[0] : 'round') as CakeShape,
        flavor: 'vanilla',
        color: 'pastel_yellow',
        design: (dynamicToppings.length > 0 ? dynamicToppings[0] : 'classic') as CakeDesign, // Fallback to classic only if empty
        message: ''
    };

    let cakeId = '';
    let fetchedCake = null;

    // Check for 5 segments: [id, shape, flavor, color, design]
    if (slug && slug.length >= 5) {
        const [id, shape, flavor, color, design] = slug;
        cakeId = id;

        // Validation: Check against strict lists for Flavor/Color, but Dynamic lists for Shape/Design
        const isShapeValid = dynamicShapes.includes(shape) || SHAPES.includes(shape as any);
        const isDesignValid = dynamicToppings.includes(design) || DESIGNS.includes(design as any);
        // Note: We might want to be lenient on legacy/hardcoded ones too just in case

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
                    color: (fetchedCake.allowedColors[0] || 'pastel_yellow') as CakeColor,
                    design: (fetchedCake.allowedDesigns[0] || 'classic') as CakeDesign,
                    message: ''
                };
            }
        } catch (e) { }
    }

    if (fetchedCake) {
        fetchedCake._id = fetchedCake._id.toString();
        // FORCE UNLOCK: Clear restricted designs so the UI shows ALL dynamic options found
        // This satisfies "provide this option to choose all the toppings"
        if (fetchedCake.allowedDesigns) {
            fetchedCake.allowedDesigns = [];
        }
    }

    // Dynamic Asset Loading (Already loaded above)


    return (
        <CustomizationClient
            config={config}
            cakeId={cakeId}
            fetchedCake={fetchedCake}
            availableShapes={dynamicShapes}
            availableToppings={dynamicToppings}
        />
    );
}
