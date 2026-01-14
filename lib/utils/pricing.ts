import { CakeConfig, SHAPES, FLAVORS, COLORS, DESIGNS } from '@/lib/types/customization';

const BASE_PRICE = 30;

const PRICES = {
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
        naked: 5
    }
};

export function calculatePrice(config: CakeConfig): number {
    let price = BASE_PRICE;
    price += PRICES.shape[config.shape] || 0;
    price += PRICES.flavor[config.flavor] || 0;
    price += PRICES.color[config.color] || 0;
    price += (PRICES.design as Record<string, number>)[config.design] || 0;

    if (config.message) {
        price += 5; // Flat fee for message
    }

    return price;
}
