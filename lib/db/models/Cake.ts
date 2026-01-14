import mongoose, { Schema, Document } from 'mongoose';

export interface ICake extends Document {
    name: string;
    basePrice: number;
    allowedShapes: string[];
    allowedFlavors: string[];
    allowedColors: string[];
    allowedDesigns: string[];
    isActive: boolean;
    images: string[];
}

const CakeSchema = new Schema<ICake>({
    name: { type: String, required: true },
    basePrice: { type: Number, required: true },
    allowedShapes: [{ type: String }],
    allowedFlavors: [{ type: String }],
    allowedColors: [{ type: String }],
    allowedDesigns: [{ type: String }],
    isActive: { type: Boolean, default: true },
    images: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.models.Cake || mongoose.model<ICake>('Cake', CakeSchema);
