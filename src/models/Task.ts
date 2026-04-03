import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  status: 'pending' | 'completed' | 'missed';
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
});

const Task = models.Task || model<ITask>('Task', TaskSchema);
export default Task;
