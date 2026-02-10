import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Define specific schema for migration to avoid issues with current model definitions if they have changed and not recompiled
const OutletSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    slug: { type: String, unique: true, trim: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Prevent overwrite error
const Outlet = mongoose.models.Outlet || mongoose.model('Outlet', OutletSchema);

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        const outlets = await Outlet.find({});
        console.log(`Found ${outlets.length} outlets.`);

        for (const outlet of outlets) {
            if (!outlet.slug) {
                const slug = outlet.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                console.log(`Updating outlet "${outlet.name}" with slug: ${slug}`);
                outlet.slug = slug;
                await outlet.save();
            } else {
                console.log(`Outlet "${outlet.name}" already has slug: ${outlet.slug}`);
            }
        }

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
