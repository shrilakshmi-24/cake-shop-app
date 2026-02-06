import mongoose, { Schema, Document } from 'mongoose';

export interface IOutlet extends Document {
    name: string;
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const OutletSchema = new Schema<IOutlet>({
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Outlet;
}

export default mongoose.models.Outlet || mongoose.model<IOutlet>('Outlet', OutletSchema);
