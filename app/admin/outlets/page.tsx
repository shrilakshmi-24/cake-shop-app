import Link from 'next/link';
import { getOutlets } from '@/lib/actions/outlet';
import AddManagerButton from '@/components/admin/AddManagerButton';

export default async function OutletsPage() {
    const outlets = await getOutlets();

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Outlets</h1>
                <Link
                    href="/admin/outlets/create"
                    className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                    Add Outlet
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="p-4 font-medium text-gray-500">Name</th>
                                <th className="p-4 font-medium text-gray-500">Address</th>
                                <th className="p-4 font-medium text-gray-500">Status</th>
                                <th className="p-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {outlets.map((outlet: any) => (
                                <tr key={outlet._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                    <td className="p-4 font-medium text-gray-900">{outlet.name}</td>
                                    <td className="p-4 text-gray-600">{outlet.address}</td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${outlet.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {outlet.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {/* TODO: proper edit/delete */}
                                            <span className="text-gray-400 cursor-not-allowed">Edit</span>

                                            {/* Add Manager UI - Simple prompt based implementation for MVP speed */}
                                            <AddManagerButton outletId={outlet._id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {outlets.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No outlets found. Create one to get started.
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
