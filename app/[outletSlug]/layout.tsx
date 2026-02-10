import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db/connect';
import Outlet from '@/lib/db/models/Outlet';
import { OutletProvider } from '@/contexts/OutletContext';
import { OutletHeader } from '@/components/layout/OutletHeader';

interface OutletLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        outletSlug: string;
    }>;
}

export default async function OutletLayout({ children, params }: OutletLayoutProps) {
    const { outletSlug } = await params;

    await dbConnect();
    const outlet = await Outlet.findOne({ slug: outletSlug, isActive: true }).lean();

    if (!outlet) {
        notFound();
    }

    // Convert _id and dates to string to pass to client component
    const plainOutlet = JSON.parse(JSON.stringify(outlet));

    return (
        <OutletProvider outlet={plainOutlet}>
            <OutletHeader outlet={plainOutlet} />
            {children}
        </OutletProvider>
    );
}
