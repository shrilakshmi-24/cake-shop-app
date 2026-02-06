'use client';

import { createOutletManager } from '@/lib/actions/create-manager';
import { useState } from 'react';

export default function AddManagerButton({ outletId }: { outletId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !name) return;

        setLoading(true);
        setMessage('');
        try {
            await createOutletManager(outletId, email, name);
            setMessage(`Success! Login: ${email}`);
            setTimeout(() => {
                setIsOpen(false);
                setEmail('');
                setName('');
                setMessage('');
            }, 3000);
        } catch (e: any) {
            setMessage('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (isOpen) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                    <h3 className="text-lg font-bold mb-4">Add Manager</h3>

                    {message && (
                        <div className={`p-3 rounded text-sm mb-4 ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                            <input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                                placeholder="manager@example.com"
                                type="email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-medium hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
                            >
                                {loading ? 'Adding...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsOpen(true)}
            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
        >
            Add Manager
        </button>
    );
}
