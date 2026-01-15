import Image from 'next/image';
import { CakeConfig, COLOR_HEX_MAP } from '@/lib/types/customization';

interface CakePreviewProps {
    config: CakeConfig;
    printImageFile?: File | null;
}

export function CakePreview({ config, printImageFile }: CakePreviewProps) {
    const { shape, color, design } = config;

    // Create object URL for print image preview if available
    const printImageUrl = printImageFile ? URL.createObjectURL(printImageFile) : null;

    return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-white/50">
            <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">

                {/* 
                  1. Shape & Color Layer (CSS Mask) 
                  - Use the shape PNG as a mask
                  - Apply the selected color as background
                */}
                <div
                    className="absolute inset-0 z-10"
                    style={{
                        backgroundColor: COLOR_HEX_MAP[config.color] || '#fde68a', // Fallback
                        maskImage: `url(/cake/shapes/${shape}.svg)`,
                        WebkitMaskImage: `url(/cake/shapes/${shape}.svg)`,
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                    }}
                >
                    {/* Shadow / Depth overlay could go here if needed, but keeping it simple as requested */}
                </div>

                {/* 2. Topping / Design Layer (Transparent PNG) */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Only render if we have a valid topping URL (sanity check handled by page defaults now) */}
                    <img
                        src={`/cake/toppings/${design}.svg`}
                        alt={`${design} design`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>

                {/* 3. User Print Image (Topmost) */}
                {printImageUrl && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                        <div className="w-1/3 h-1/3 relative transform -translate-y-4">
                            <img
                                src={printImageUrl}
                                alt="Print Preview"
                                className="w-full h-full object-contain rounded-md shadow-sm opacity-90"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}
