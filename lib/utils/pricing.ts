import { CakeConfig, SHAPES, FLAVORS, COLORS, DESIGNS } from '@/lib/types/customization';

const BASE_PRICE = 30;

export const PRICES = {
    shape: {
        round: 0,
        square: 5,
        heart: 10,
        mini_heart: 5
    },
    flavor: {
        vanilla: 0,
        chocolate: 5,
        red_velvet: 8,
        lemon: 4
    },
    color: {
        pastel_yellow: 0,
        pastel_red: 0,
        pastel_blue: 0,
        pastel_green: 0,
        white: 0,
        red: 2,
        pink: 2,
        blue: 2,
        yellow: 2
    },
    design: {
        classic: 0,
        modern: 10,
        drip: 15,
        naked: 5,
        zigzag: 15,
        gems: 20,
        swirl: 12,
        pearls: 18
    }
};

export const WEIGHT_MULTIPLIERS: Record<string, number> = {
    '0.5 kg': 1,
    '1 kg': 2,
    '1.5 kg': 3,
    '2 kg': 4
};

export type PriceMap = {
    shape: Record<string, number>;
    flavor: Record<string, number>;
    color: Record<string, number>;
    design: Record<string, number>;
};

export function calculatePrice(config: CakeConfig, basePriceOverride?: number, priceMap?: PriceMap): number {
    // Use provided priceMap or fallback to hardcoded PRICES
    const activePrices = priceMap || PRICES;

    // 1. Calculate Scalable Base Components (Base + Shape + Flavor + Color)
    // These costs multiply with weight (more ingredients needed)
    let scalablePrice = basePriceOverride !== undefined ? basePriceOverride : BASE_PRICE;
    scalablePrice += activePrices.shape[config.shape] || 0;
    scalablePrice += activePrices.flavor[config.flavor] || 0;

    // Handle color price (safely access if it exists in map, fallbacks to 0)
    scalablePrice += activePrices.color[config.color] || 0;

    // Apply Weight Multiplier to Scalable Base only
    const multiplier = WEIGHT_MULTIPLIERS[config.weight] || 1;
    let totalPrice = scalablePrice * multiplier;

    // 2. Add Flat Fees (Design + Message)
    // These are fixed service/labor/skill costs that don't necessarily scale linearly with weight
    // Cast to record to handle the generic access if using dynamic map
    const designPrices = activePrices.design as Record<string, number>;
    totalPrice += designPrices[config.design] || 0;

    if (config.message) {
        totalPrice += 5; // Flat fee for message
    }

    return totalPrice;
}
