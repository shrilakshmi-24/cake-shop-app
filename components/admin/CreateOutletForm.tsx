'use client';

import { createOutlet } from '@/lib/actions/outlet';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateOutletForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const name = formData.get('name') as string;
            const address = formData.get('address') as string;
            const lat = parseFloat(formData.get('lat') as string);
            const lng = parseFloat(formData.get('lng') as string);

            await createOutlet({
                name,
                address,
                coordinates: { lat, lng },
                isActive: true
            });

            router.push('/admin/outlets');
        } catch (err) {
            setError('Failed to create outlet. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Outlet Name</label>
                <input
                    name="name"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    placeholder="e.g. Downtown Branch"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                    name="address"
                    required
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    placeholder="Full street address..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                    <input
                        name="lat"
                        type="number"
                        step="any"
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                        placeholder="e.g. 12.9716"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                    <input
                        name="lng"
                        type="number"
                        step="any"
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                        placeholder="e.g. 77.5946"
                    />
                </div>
            </div>

            <p className="text-xs text-gray-500">
                Tip: You can get coordinates from Google Maps (Right click &gt; Copy numbers).
            </p>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Outlet'}
                </button>
            </div>
        </form>
    );
}
