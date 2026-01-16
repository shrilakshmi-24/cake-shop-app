'use client';

import { useState } from 'react';
import { submitReview } from '@/lib/actions/review';
import { useToast } from '@/contexts/ToastContext';

export function ReviewButton({ orderId, existingReview }: { orderId: string, existingReview?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(existingReview || false);
    const { showToast } = useToast();

    if (isSubmitted) {
        return <span className="text-xs text-green-600 font-medium">✓ Reviewed</span>;
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const result = await submitReview(orderId, rating, message);
        setIsSubmitting(false);

        if (result.success) {
            showToast('Thank you for your feedback!', 'success');
            setIsSubmitted(true);
            setIsOpen(false);
        } else {
            showToast(result.error || 'Failed to submit review', 'error');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 border border-indigo-100 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
            >
                ★ Write Review
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>

                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900">Rate your Cake</h3>
                            <p className="text-sm text-gray-500">How was your experience?</p>
                        </div>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-2 py-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="Tell us more (optional)..."
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all disabled:opacity-70"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
