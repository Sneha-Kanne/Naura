import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IExtraLog extends Document {
  userId: mongoose.Types.ObjectId;
  description: string;
  points: number;
  createdAt: Date;
}

const ExtraLogSchema = new Schema<IExtraLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  points: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

const ExtraLog = models.ExtraLog || model<IExtraLog>('ExtraLog', ExtraLogSchema);
export default ExtraLog;
