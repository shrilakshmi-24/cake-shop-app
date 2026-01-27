import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Cake from '@/lib/db/models/Cake';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { EditCakeForm } from '@/components/admin/EditCakeForm';

export default async function EditCakePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        redirect('/login');
    }

    const { id } = await params;
    await dbConnect();
    // We must serialize the cake for the client component (ObjectId to string)
    const cakeRaw = await Cake.findById(id).lean();
    if (!cakeRaw) {
        notFound();
    }

    const cake = {
        ...cakeRaw,
        _id: cakeRaw._id.toString(),
        // Check array items if they are ObjectIds? They seem to be strings in schema.
        // Allowed arrays are strings. Images strings.
        createdAt: (cakeRaw as any).createdAt?.toISOString(),
        updatedAt: (cakeRaw as any).updatedAt?.toISOString(),
    };

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

                <EditCakeForm cake={cake} />
            </div>
        </main>
    );
}
