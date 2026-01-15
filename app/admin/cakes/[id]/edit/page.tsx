import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';
import { updateCake } from '@/lib/actions/cake';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import Image from 'next/image';

export default async function EditCakePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        redirect('/login');
    }

    const { id } = await params;
    await dbConnect();
    const cake = await Cake.findById(id).lean();

    if (!cake) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin/cakes" className="text-sm text-gray-500 hover:text-gray-900 mb-4 block">
                        &larr; Back to Cakes
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Cake</h1>
                    <p className="mt-2 text-gray-600">Update configuration options for {cake.name}.</p>
                </div>

                <form action={async (formData: FormData) => {
                    'use server';
                    await updateCake(id, null, formData);
                }} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input type="text" name="name" defaultValue={cake.name} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
                        <input type="number" name="basePrice" defaultValue={cake.basePrice} step="0.01" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
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
                    </div>
                </form>
            </div>
        </main>
    );
}
