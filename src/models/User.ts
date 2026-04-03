import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
    password: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const User = models.User || model<IUser>('User', UserSchema);
export default User;
