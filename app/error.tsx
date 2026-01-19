'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-rose-50 p-8 rounded-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-rose-900 mb-4">Something went wrong!</h2>
                <p className="text-gray-600 mb-6">
                    We apologize for the inconvenience. Our bakers are looking into the issue.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-full transition-colors"
                    >
                        Try again
                    </button>
                    <a
                        href="/"
                        className="px-6 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium rounded-full transition-colors"
                    >
                        Return Home
                    </a>
                </div>
            </div>
        </div>
    );
}
