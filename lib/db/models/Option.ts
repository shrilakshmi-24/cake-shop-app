import mongoose, { Schema, Document, Model } from 'mongoose';

export type OptionType = 'shape' | 'flavor' | 'color' | 'design';

export interface IOption extends Document {
    type: OptionType;
    name: string;
    slug: string;
    price: number;
    isActive: boolean;
    image?: string;
    metadata?: Record<string, any>; // For things like color hex, flavor description
    createdAt: Date;
    updatedAt: Date;
}

const OptionSchema = new Schema<IOption>(
    {
        type: {
            type: String,
            required: true,
            enum: ['shape', 'flavor', 'color', 'design'],
            index: true
        },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        price: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        image: { type: String }, // Path to SVG or image URL
        metadata: { type: Map, of: Schema.Types.Mixed }
    },
    { timestamps: true }
);

// Composite index for uniqueness
OptionSchema.index({ type: 1, slug: 1 }, { unique: true });

const Option: Model<IOption> = mongoose.models.Option || mongoose.model<IOption>('Option', OptionSchema);

export default Option;
