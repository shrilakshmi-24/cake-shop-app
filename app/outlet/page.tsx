import { getOutletOrders } from '@/lib/actions/outlet-order';
import OutletOrderList from '@/components/outlet/OutletOrderList';

export default async function OutletDashboard() {
    const orders = await getOutletOrders();

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Incoming Orders</h1>
            <OutletOrderList initialOrders={orders} />
        </main>
    );
}
