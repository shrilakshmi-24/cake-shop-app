import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { toggleCakeStatus } from '@/lib/actions/cake';

export const dynamic = 'force-dynamic';

export default async function AdminCakesPage() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        redirect('/login');
    }

    await dbConnect();
    const cakes = await Cake.find({}).sort({ createdAt: -1 });

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cake Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your product catalogue.</p>
                    </div>
                    <Link href="/admin/cakes/create" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-black transition text-sm font-medium shadow-sm">
                        + Add New Cake
                    </Link>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-black/5 sm:rounded-2xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Name</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Price</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Variants</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {cakes.map((cake: any) => (
                                <tr key={cake._id.toString()} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-900">{cake.name}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-mono">₹{cake.basePrice.toFixed(2)}</td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                        {cake.allowedShapes.length} Shapes • {cake.allowedFlavors.length} Flavors
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cake.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cake.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                            {cake.isActive ? 'Active' : 'Archived'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/cakes/${cake._id.toString()}/edit`}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <form action={toggleCakeStatus.bind(null, cake._id.toString(), cake.isActive)} className="inline-block">
                                            <button className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${cake.isActive
                                                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                                }`}>
                                                {cake.isActive ? 'Disable' : 'Activate'}
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {cakes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-sm text-gray-500">
                                        No cakes found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
