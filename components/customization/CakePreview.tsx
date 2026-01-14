export function CakePreview({ config }: { config: any }) {
    // Determine visuals based on config (Placeholder logic preserved but styled better)

    return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-white">
            <div className="relative w-full max-w-md aspect-square bg-[#FAFAFA] rounded-[3rem] shadow-inner flex items-center justify-center p-12 transition-all duration-500">

                {/* Plate Shadow */}
                <div className="absolute bottom-20 w-3/4 h-8 bg-black/5 rounded-[100%] blur-xl" />

                {/* Cake Base Representation */}
                <div
                    className={`
                  relative z-10 w-48 h-48 transition-all duration-500 transform
                  ${config.shape === 'square' ? 'rounded-3xl' : 'rounded-full'}
                  ${config.shape === 'heart' ? 'rounded-full after:content-[""] after:absolute after:-left-12 after:top-0 after:w-48 after:h-48 after:rounded-full after:bg-inherit before:content-[""] before:absolute before:-top-12 before:left-0 before:w-48 before:h-48 before:rounded-full before:bg-inherit rotate-45 mt-10' : ''}
              `}
                    style={{
                        backgroundColor: config.color === 'white' ? '#f0f0f0' : config.color
                    }}
                >
                    {/* Optional Decoration layer */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-50">
                        <span className="text-xs font-mono uppercase tracking-widest text-black/20">
                            {config.flavor} / {config.design}
                        </span>
                    </div>
                </div>

                {/* Text Overlay for context (temporary viz) */}
                <div className="absolute bottom-10 left-0 right-0 text-center">
                    <span className="inline-block px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium text-gray-500 shadow-sm">
                        {config.shape} • {config.color}
                    </span>
                </div>
            </div>
        </div>
    )
}
