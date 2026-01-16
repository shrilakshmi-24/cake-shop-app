import { auth } from '@/auth';
import { CustomRequestClient } from '@/components/customization/CustomRequestClient';

export const dynamic = 'force-dynamic';

export default async function CustomRequestPage() {
    return (
        <CustomRequestClient />
    );
}
