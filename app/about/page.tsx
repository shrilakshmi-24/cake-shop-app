
export const dynamic = 'force-static';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-gray-50 font-sans">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100 py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-6">
                        Baking Memories, One Cake at a Time.
                    </h1>
                    <p className="text-xl text-gray-500 leading-relaxed">
                        We believe that every celebration deserves a centerpiece as unique and special as the person being celebrated. That's why we don't just bake cakes; we craft edible art.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
                        <p className="text-gray-600 text-lg">
                            Founded in 2024, Cake Shop started with a simple mission: to make custom cake ordering as delightful as eating the cake itself.
                        </p>
                        <p className="text-gray-600 text-lg">
                            Frustrated by rigid menus and confusing ordering processes, we built a platform where *you* are the designer. From the shape of the base to the final sprinkle of edible glitter, every choice is yours.
                        </p>
                        <div className="pt-4">
                            <h3 className="font-bold text-gray-900 mb-2">Our Promise</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="text-red-500">❤️</span> Handcrafted with premium ingredients
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">🚚</span> Fresh delivery to your doorstep
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✨</span> 100% Customization freedom
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="relative h-96 rounded-3xl overflow-hidden bg-gray-200 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                        {/* Placeholder for a nice image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-red-50 flex items-center justify-center">
                            <span className="text-6xl">🍰</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
