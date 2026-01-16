import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    userId: string;
    userName: string; // Store name to avoid extra lookups
    cakeId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    rating: number;
    message?: string;
    createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    cakeId: { type: Schema.Types.ObjectId, ref: 'Cake', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true }, // One review per order
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, maxlength: 500 }
}, { timestamps: true });

// Index for fast lookup of cake reviews
ReviewSchema.index({ cakeId: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
