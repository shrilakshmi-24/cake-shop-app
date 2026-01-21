'use server';

import dbConnect from '@/lib/db/connect';
import Option, { IOption, OptionType } from '@/lib/db/models/Option';
import { revalidateTag, unstable_cache } from 'next/cache';

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

// Cached getOptions function
// Cached getOptions function
export const getOptions = unstable_cache(
    async (type?: OptionType) => {
        await dbConnect();
        const query = { isActive: true, ...(type && { type }) };
        const options = await Option.find(query).sort({ price: 1 }).lean();
        return JSON.parse(JSON.stringify(options));
    },
    ['options-data'], // Base key
    { tags: ['options'] }
);

// Get all options including inactive ones for admin
export async function getAdminOptions(type?: OptionType) {
    await dbConnect();
    const query = type ? { type } : {};
    const options = await Option.find(query).sort({ type: 1, price: 1 }).lean();
    return JSON.parse(JSON.stringify(options)) as IOption[];
}

export async function createOption(data: Partial<IOption>) {
    try {
        await dbConnect();

        // Generate slug if not provided
        if (!data.slug && data.name) {
            data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        }

        const option = await Option.create(data);
        revalidateTag('options');
        return { success: true, data: JSON.parse(JSON.stringify(option)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateOption(id: string, data: Partial<IOption>) {
    try {
        await dbConnect();
        const option = await Option.findByIdAndUpdate(id, data, { new: true }).lean();
        revalidateTag('options');
        return { success: true, data: JSON.parse(JSON.stringify(option)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteOption(id: string) {
    try {
        await dbConnect();
        // Soft delete by setting isActive to false, or hard delete?
        // Let's implement hard delete for now as per "Delete" requirement, 
        // but often soft delete is better. User specifically asked "Delete" so...
        // Actually, let's just delete it.
        await Option.findByIdAndDelete(id);
        revalidateTag('options');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
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

    revalidateTag('options');
    return { success: true, count: results.length };
}
