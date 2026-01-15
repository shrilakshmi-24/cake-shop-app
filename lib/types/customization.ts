export const SHAPES = ['round', 'heart', 'square', 'mini_heart'] as const;
export const FLAVORS = ['vanilla', 'chocolate', 'red_velvet', 'lemon'] as const; // Keeping flavors for data model, though not visually distinct in new preview?
// User said "Color layer... NO images for color... Example: pastel_red -> #fca5a5"
export const THIS_IS_A_BREAKING_CHANGE_FOR_OLD_LOGIC = true;

export const COLORS = ['pastel_red', 'pastel_blue', 'pastel_yellow', 'pastel_green'] as const;

export const COLOR_HEX_MAP: Record<string, string> = {
    pastel_red: '#fca5a5',
    pastel_blue: '#93c5fd',
    pastel_yellow: '#fde68a',
    pastel_green: '#86efac',
    // Fallbacks just in case
    white: '#ffffff',
    red: '#fca5a5',
    pink: '#fca5a5',
    blue: '#93c5fd',
    yellow: '#fde68a'
};
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
    notes?: string; // Additional Guide / Instructions
    printImageUrl?: string; // URL from Cloudinary
}

export const DEFAULT_CONFIG: CakeConfig = {
    shape: 'round',
    flavor: 'vanilla',
    color: 'pastel_yellow', // Updated to match new COLORS
    design: 'classic', // This might need to be dynamic too if classic is missing, but for type consistency this is fine for now
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
