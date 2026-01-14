export const SHAPES = ['round', 'heart', 'square', 'mini_heart'] as const;
export const FLAVORS = ['vanilla', 'chocolate', 'red_velvet', 'lemon'] as const;
export const COLORS = ['white', 'red', 'pink', 'blue', 'yellow'] as const;
export const DESIGNS = ['classic', 'modern', 'drip', 'naked'] as const;

export type CakeShape = typeof SHAPES[number];
export type CakeFlavor = typeof FLAVORS[number];
export type CakeColor = typeof COLORS[number];
export type CakeDesign = typeof DESIGNS[number];

export interface CakeConfig {
    shape: CakeShape;
    flavor: CakeFlavor;
    color: CakeColor;
    design: string;
    message: string;
    customImage?: string; // URL from Cloudinary
}

export const DEFAULT_CONFIG: CakeConfig = {
    shape: 'round',
    flavor: 'vanilla',
    color: 'white',
    design: 'classic',
    message: '',
};

// Helper to validate segments
export function isValidConfig(
    shape: string,
    flavor: string,
    color: string,
    design: string
): boolean {
    return (
        SHAPES.includes(shape as CakeShape) &&
        FLAVORS.includes(flavor as CakeFlavor) &&
        COLORS.includes(color as CakeColor) &&
        DESIGNS.includes(design as CakeDesign)
    );
}
