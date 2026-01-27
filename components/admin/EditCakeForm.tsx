'use client';

import { useActionState } from 'react';
import { updateCake } from '@/lib/actions/cake';
import { useToast } from '@/contexts/ToastContext';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface EditCakeFormProps {
    cake: any;
}

export function EditCakeForm({ cake }: EditCakeFormProps) {
    // Bind the cake ID to the action so we don't need a hidden input or complex wrapper
    const updateCakeWithId = updateCake.bind(null, cake._id);
    const [state, dispatch] = useActionState(updateCakeWithId, null);
    const { showToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (state?.message) {
            if (state.message.includes('Failed') || state.message.includes('error')) {
                showToast(state.message, 'error');
            } else {
                showToast(state.message || 'Updated successfully', 'success');
                setTimeout(() => {
                    router.push('/admin/cakes');
                    router.refresh();
                }, 1500);
            }
        }
    }, [state, showToast, router]);

    return (
        <form action={dispatch} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-8 space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input type="text" name="name" defaultValue={cake.name} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
                <input type="number" name="basePrice" defaultValue={cake.basePrice} step="0.01" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" defaultValue={cake.description || ''} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" placeholder="A brief description of the cake..." />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Product Images</label>
                {/* Show existing images */}
                {cake.images && cake.images.length > 0 && (
                    <div className="mt-2 mb-4 flex gap-2 overflow-x-auto pb-2">
                        {cake.images.map((img: string, idx: number) => (
                            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                <Image src={img} alt="Cake" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 bg-gray-50 hover:bg-gray-100 transition">
                    <div className="text-center">
                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                                <span>Upload files</span>
                                <input id="file-upload" name="images" type="file" multiple accept="image/*" className="sr-only" />
                            </label>
                            <p className="pl-1">to append</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">PxP, JPG, GIF up to 10MB</p>
                    </div>
                </div>
            </div>

            <div className="border-t pt-6 bg-indigo-50 p-4 rounded-lg">
                <p className="text-xs text-indigo-800 mb-2 font-semibold">Comma separated values</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Allowed Shapes</label>
                        <input type="text" name="allowedShapes" defaultValue={cake.allowedShapes.join(', ')} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Allowed Flavors</label>
                        <input type="text" name="allowedFlavors" defaultValue={cake.allowedFlavors.join(', ')} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Allowed Colors</label>
                        <input type="text" name="allowedColors" defaultValue={cake.allowedColors.join(', ')} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Allowed Designs</label>
                        <input type="text" name="allowedDesigns" defaultValue={cake.allowedDesigns.join(', ')} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition font-medium">
                    Save Changes
                </button>
                {state?.message && <p className="mt-2 text-sm text-gray-600">{state.message}</p>}
            </div>
        </form>
    );
}
