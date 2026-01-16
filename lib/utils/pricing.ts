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

export function calculatePrice(config: CakeConfig, basePriceOverride?: number): number {
    let price = basePriceOverride !== undefined ? basePriceOverride : BASE_PRICE;
    price += PRICES.shape[config.shape] || 0;
    price += PRICES.flavor[config.flavor] || 0;
    price += PRICES.color[config.color] || 0;
    price += (PRICES.design as Record<string, number>)[config.design] || 0;

    if (config.message) {
        price += 5; // Flat fee for message
    }

    // Apply Weight Multiplier
    // Default to 1 (0.5 kg) if weight is missing for some reason
    const multiplier = WEIGHT_MULTIPLIERS[config.weight] || 1;
    price = price * multiplier;

    return price;
}
