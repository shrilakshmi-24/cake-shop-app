'use client';

import { IReview } from '@/lib/db/models/Review';

export function ReviewsList({ reviews }: { reviews: any[] }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm mt-12">
                <span className="text-4xl block mb-2">⭐</span>
                <h3 className="text-lg font-bold text-gray-900">No ratings yet</h3>
                <p className="text-gray-500">Be the first to order and review this cake!</p>
            </div>
        );
    }

    // Calculate Average
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    return (
        <div className="mt-16 border-t border-gray-100 pt-12">
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                    <span className="text-yellow-500 font-bold">★</span>
                    <span className="font-bold text-yellow-700">{averageRating}</span>
                    <span className="text-yellow-600 text-sm">({reviews.length})</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                    <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                                    {review.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{review.userName}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex text-yellow-400 text-sm">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                ))}
                            </div>
                        </div>
                        {review.message && (
                            <p className="text-gray-600 text-sm leading-relaxed">"{review.message}"</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
