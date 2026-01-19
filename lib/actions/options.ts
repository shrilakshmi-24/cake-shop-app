'use server';

import dbConnect from '@/lib/db/connect';
import Option, { IOption, OptionType } from '@/lib/db/models/Option';

// Hardcoded initial data for seeding
const INITIAL_DATA = {
    shape: [
        { slug: 'round', name: 'Round', price: 0 },
        { slug: 'square', name: 'Square', price: 5 },
        { slug: 'heart', name: 'Heart', price: 10 },
        { slug: 'mini_heart', name: 'Mini Heart', price: 5 },
    ],
    flavor: [
        { slug: 'vanilla', name: 'Vanilla', price: 0, metadata: { desc: 'Classic Madagascan', bg: 'bg-amber-50' } },
        { slug: 'chocolate', name: 'Chocolate', price: 5, metadata: { desc: 'Rich Belgian Dark', bg: 'bg-stone-100' } },
        { slug: 'red_velvet', name: 'Red Velvet', price: 8, metadata: { desc: 'Cream Cheese Frosting', bg: 'bg-red-50' } },
        { slug: 'lemon', name: 'Lemon', price: 4, metadata: { desc: 'Zesty Lemon Curd', bg: 'bg-yellow-50' } },
    ],
    color: [
        { slug: 'pastel_yellow', name: 'Pastel Yellow', price: 0, metadata: { hex: '#fde68a' } },
        { slug: 'pastel_red', name: 'Pastel Red', price: 0, metadata: { hex: '#fca5a5' } },
        { slug: 'pastel_blue', name: 'Pastel Blue', price: 0, metadata: { hex: '#93c5fd' } },
        { slug: 'pastel_green', name: 'Pastel Green', price: 0, metadata: { hex: '#86efac' } },
        // Premium Colors
        { slug: 'red', name: 'Red', price: 2, metadata: { hex: '#fca5a5' } },
        { slug: 'pink', name: 'Pink', price: 2, metadata: { hex: '#fca5a5' } },
        { slug: 'blue', name: 'Blue', price: 2, metadata: { hex: '#93c5fd' } },
        { slug: 'yellow', name: 'Yellow', price: 2, metadata: { hex: '#fde68a' } },
    ],
    design: [
        { slug: 'classic', name: 'Classic', price: 0 },
        { slug: 'modern', name: 'Modern', price: 10 },
        { slug: 'drip', name: 'Drip', price: 15 },
        { slug: 'naked', name: 'Naked', price: 5 },
        { slug: 'zigzag', name: 'Zigzag', price: 15 },
        { slug: 'gems', name: 'Gems', price: 20 },
        { slug: 'swirl', name: 'Swirl', price: 12 },
        { slug: 'pearls', name: 'Pearls', price: 18 },
    ]
};

export async function getOptions(type?: OptionType) {
    await dbConnect();
    const query = { isActive: true, ...(type && { type }) };
    const options = await Option.find(query).sort({ price: 1 }).lean();

    // Serialize for client components
    return JSON.parse(JSON.stringify(options));
}

export async function seedOptions() {
    await dbConnect();

    const results = [];

    for (const [type, items] of Object.entries(INITIAL_DATA)) {
        for (const item of items) {
            const option = await Option.findOneAndUpdate(
                { type, slug: item.slug },
                {
                    ...item,
                    type,
                    isActive: true,
                    // Auto-assign image path for shapes/designs if not specified
                    image: (type === 'design')
                        ? `/cake/toppings/${item.slug}.svg`
                        : (type === 'shape') ? `/cake/shapes/${item.slug}.svg` : undefined
                },
                { upsert: true, new: true }
            );
            results.push(option);
        }
    }

    return { success: true, count: results.length };
}
