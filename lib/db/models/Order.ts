import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    userId: string;
    cakeId: mongoose.Types.ObjectId;
    customizationSnapshot: {
        shape: string;
        flavor: string;
        color: string;
        design: string;
        message?: string;
        customImage?: string;
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
        color: { type: String, required: true },
        design: { type: String, required: true },
        message: { type: String },
        customImage: { type: String }
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
