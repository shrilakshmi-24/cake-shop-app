export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-rose-50/50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-rose-200 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-t-rose-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-rose-500 font-medium animate-pulse">Baking your experience...</p>
            </div>
        </div>
    );
}
