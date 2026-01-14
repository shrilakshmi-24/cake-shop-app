import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    userId: string;
    cakeId: mongoose.Types.ObjectId;
    customizationSnapshot: {
        shape: string;
        flavor: string;
        color: string;
        message?: string;
        notes?: string;
        printImageUrl?: string;
    };
    finalPrice: number;
    status: 'PLACED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    userId: { type: String, required: true },
    cakeId: { type: Schema.Types.ObjectId, ref: 'Cake', required: true },
    customizationSnapshot: {
        shape: { type: String, required: true },
        flavor: { type: String, required: true },
        design: { type: String, required: true }, // Added based on Code Edit
        message: { type: String }, // Added based on Code Edit
        notes: { type: String }, // Added notes field
        printImageUrl: { type: String }
    },
    finalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PLACED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
        default: 'PLACED'
    },
    rejectionReason: { type: String }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
