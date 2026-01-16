import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    userId: string;
    cakeId?: mongoose.Types.ObjectId;
    customizationSnapshot: {
        shape: string;
        flavor: string;
        color: string;
        design: string;
        weight: string;
        eggType: 'egg' | 'eggless';
        message?: string;
        notes?: string;
        printImageUrl?: string;
        referenceImageUrl?: string;
    };
    orderType: 'EXISTING_CAKE' | 'CUSTOMIZED_CAKE' | 'IMAGE_REFERENCE_CAKE';
    contactDetails: {
        name: string;
        phone: string;
    };
    deliveryAddress: {
        houseNo: string;
        street: string;
        landmark?: string;
        city: string;
        zip: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
        googleMapUrl?: string;
        fullFormatted: string;
    };
    deliveryDate: string;
    deliveryTime: string;
    finalPrice: number;
    status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    userId: { type: String, required: true },
    cakeId: { type: Schema.Types.ObjectId, ref: 'Cake' }, // Optional for IMAGE_REFERENCE_CAKE
    customizationSnapshot: {
        shape: { type: String, required: true },
        flavor: { type: String, required: true },
        color: { type: String, required: true },
        design: { type: String, required: true },
        weight: { type: String, required: true },
        eggType: { type: String, enum: ['egg', 'eggless'], required: true },
        message: { type: String },
        notes: { type: String },
        printImageUrl: { type: String },
        referenceImageUrl: { type: String } // New: For reference images
    },
    orderType: {
        type: String,
        enum: ['EXISTING_CAKE', 'CUSTOMIZED_CAKE', 'IMAGE_REFERENCE_CAKE'],
        default: 'CUSTOMIZED_CAKE'
    },
    contactDetails: {
        name: { type: String, required: true },
        phone: { type: String, required: true }
    },
    deliveryAddress: {
        houseNo: { type: String, required: true },
        street: { type: String, required: true },
        landmark: { type: String },
        city: { type: String, required: true },
        zip: { type: String, required: true },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        },
        googleMapUrl: { type: String },
        fullFormatted: { type: String, required: true }
    },
    deliveryDate: { type: String, required: true },
    deliveryTime: { type: String, required: true },
    finalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
        default: 'PLACED'
    },
    rejectionReason: { type: String }
}, { timestamps: true });

// Force recompilation of model in dev to ensure schema updates (notes/printImageUrl) are applied
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
