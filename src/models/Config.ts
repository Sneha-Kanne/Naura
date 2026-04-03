import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IConfig extends Document {
  userId: mongoose.Types.ObjectId;
  auraScore: number;
}

const ConfigSchema = new Schema<IConfig>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  auraScore: { type: Number, default: 0 },
});

const Config = models.Config || model<IConfig>('Config', ConfigSchema);
export default Config;
