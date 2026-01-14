'use client';

import { useActionState } from 'react';
import { createCake } from '@/lib/actions/cake';
import Link from 'next/link';

export default function CreateCakePage() {
    const [state, dispatch] = useActionState(createCake, null);

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin/cakes" className="text-sm text-gray-500 hover:text-gray-900 mb-4 block">
                        &larr; Back to Cakes
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Cake</h1>
                    <p className="mt-2 text-gray-600">Define the configuration options for a new cake type.</p>
                </div>

                <form action={dispatch} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input type="text" name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Base Price ($)</label>
                        <input type="number" name="basePrice" step="0.01" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Images</label>
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 bg-gray-50 hover:bg-gray-100 transition">
                            <div className="text-center">
                                <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-red-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2 hover:text-red-500">
                                        <span>Upload files</span>
                                        <input id="file-upload" name="images" type="file" multiple accept="image/*" className="sr-only" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs leading-5 text-gray-600">PxP, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6 bg-yellow-50 p-4 rounded-lg">
                        <p className="text-xs text-yellow-800 mb-2 font-semibold">Comma separated values (e.g. round, square, heart)</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Allowed Shapes</label>
                                <input type="text" name="allowedShapes" defaultValue="round, square, heart, mini_heart" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Allowed Flavors</label>
                                <input type="text" name="allowedFlavors" defaultValue="vanilla, chocolate, red_velvet, lemon" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Allowed Colors</label>
                                <input type="text" name="allowedColors" defaultValue="white, red, pink, blue, yellow" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Allowed Designs</label>
                                <input type="text" name="allowedDesigns" defaultValue="classic, modern, drip, naked" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-medium">
                            Create Cake
                        </button>
                        {state?.message && <p className="mt-2 text-sm text-red-600">{state.message}</p>}
                    </div>
                </form>
            </div>
        </main>
    );
}
