import { getAdminOptions } from '@/lib/actions/options';
import OptionsManager from '@/components/admin/OptionsManager';

export const metadata = {
    title: 'Manage Options | Admin',
    description: 'Manage cake customization options',
};

export default async function AdminOptionsPage() {
    const options = await getAdminOptions();

    return (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customization Options</h1>
                <p className="mt-2 text-gray-500">Manage available shapes, flavors, colors, and designs.</p>
            </div>

            <OptionsManager initialOptions={options} />
        </main>
    );
}
