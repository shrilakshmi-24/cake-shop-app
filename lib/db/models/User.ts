import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    name?: string;
    role: 'user' | 'admin' | 'outlet_manager';
    outletId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    name: { type: String },
    role: { type: String, enum: ['user', 'admin', 'outlet_manager'], default: 'user' },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
