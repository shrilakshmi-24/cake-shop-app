import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <Link href="/" className="flex items-center gap-2 justify-center md:justify-start group mb-2">
                            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-red-200 shadow-lg">C</div>
                            <span className="text-lg font-bold text-gray-900 tracking-tight">Cake Shop</span>
                        </Link>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Handcrafted with love. The best custom cakes for your special moments.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-gray-600">
                        <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
                        <Link href="/orders" className="hover:text-red-600 transition-colors">Track Order</Link>
                        <Link href="/about" className="hover:text-red-600 transition-colors">About Us</Link>
                    </div>

                    <div className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Cake Shop Inc.
                    </div>
                </div>
            </div>
        </footer>
    );
}
