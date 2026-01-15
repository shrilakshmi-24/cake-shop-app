import fs from 'fs';
import path from 'path';

export const ASSET_DIRS = {
    shapes: path.join(process.cwd(), 'public/cake/shapes'),
    toppings: path.join(process.cwd(), 'public/cake/toppings'),
};

export function getAvailableOptions(type: 'shapes' | 'toppings'): string[] {
    const dir = ASSET_DIRS[type];
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace(/\.svg$/, ''));
}
