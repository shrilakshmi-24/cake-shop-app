export const SHAPES = ['round', 'heart', 'square', 'mini_heart'] as const;
export const FLAVORS = ['vanilla', 'chocolate', 'red_velvet', 'lemon'] as const;
export const WEIGHTS = ['0.5 kg', '1 kg', '1.5 kg', '2 kg'] as const;
export const EGG_OPTIONS = ['egg', 'eggless'] as const;

export const THIS_IS_A_BREAKING_CHANGE_FOR_OLD_LOGIC = true;

export const COLORS = ['pastel_red', 'pastel_blue', 'pastel_yellow', 'pastel_green'] as const;

export const COLOR_HEX_MAP: Record<string, string> = {
    pastel_red: '#fca5a5',
    pastel_blue: '#93c5fd',
    pastel_yellow: '#fde68a',
    pastel_green: '#86efac',
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
export type CakeWeight = typeof WEIGHTS[number];
export type EggOption = typeof EGG_OPTIONS[number];

export interface CakeConfig {
    shape: CakeShape;
    flavor: CakeFlavor;
    color: CakeColor;
    design: string;
    weight: CakeWeight;
    eggType: EggOption;
    message: string;
    notes?: string;
    printImageUrl?: string;
}

export const DEFAULT_CONFIG: CakeConfig = {
    shape: 'round',
    flavor: 'vanilla',
    color: 'pastel_yellow',
    design: 'classic',
    weight: '0.5 kg',
    eggType: 'eggless', // Default to eggless for safety/inclusivity
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
