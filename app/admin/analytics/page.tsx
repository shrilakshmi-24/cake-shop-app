import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAnalyticsData } from '@/lib/actions/analytics';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        redirect('/login');
    }

    const data = await getAnalyticsData();
    if (!data) return <div className="p-8 text-center">Failed to load analytics.</div>;

    const { stats, statusData, dailyData, popularFlavors } = data;

    // Helper for currency
    const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

    // Find max value for scaling charts
    const maxDaily = Math.max(...dailyData.map(d => d.count), 1);

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">Business performance metrics and insights.</p>
                    </div>
                    <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        &larr; Back to Orders
                    </Link>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                        <p className="text-3xl font-extrabold text-gray-900 mt-2">{fmt(stats.revenue)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                        <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats.orders}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Order Value</p>
                        <p className="text-3xl font-extrabold text-gray-900 mt-2">{fmt(stats.avgValue)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Daily Orders Chart */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Orders (Last 7 Days)</h3>
                        <div className="flex items-end justify-between gap-2 h-48">
                            {dailyData.map((d) => (
                                <div key={d.date} className="group relative flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 relative overflow-hidden"
                                        style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: '4px' }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {d.count} orders ({fmt(d.revenue)})
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium rotate-0 whitespace-nowrap">
                                        {new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                                    </span>
                                </div>
                            ))}
                            {dailyData.length === 0 && <div className="w-full text-center text-gray-400 text-sm">No recent data</div>}
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status</h3>
                        <div className="space-y-4">
                            {statusData.map((s) => (
                                <div key={s.status} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className={`font-semibold capitalize ${s.status === 'DELIVERED' ? 'text-green-700' :
                                                s.status === 'CANCELLED' ? 'text-red-700' : 'text-gray-700'
                                            }`}>{s.status.toLowerCase()}</span>
                                        <span className="text-gray-500 font-medium">{s.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${s.status === 'DELIVERED' ? 'bg-green-500' :
                                                    s.status === 'CANCELLED' ? 'bg-red-500' :
                                                        s.status === 'PLACED' ? 'bg-gray-400' : 'bg-indigo-500'
                                                }`}
                                            style={{ width: `${(s.count / stats.orders) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Popular Flavors */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Popular Flavors</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Flavor</th>
                                    <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Orders</th>
                                    <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Share</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {popularFlavors.map((f) => (
                                    <tr key={f.flavor} className="group">
                                        <td className="py-4 text-sm font-semibold text-gray-900 capitalize flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                            {f.flavor.replace('_', ' ')}
                                        </td>
                                        <td className="py-4 text-right text-sm text-gray-600 font-mono">{f.count}</td>
                                        <td className="py-4 text-right text-sm text-gray-400 pb-1">
                                            {Math.round((f.count / stats.orders) * 100)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
