import mongoose, { Schema, Document } from 'mongoose';

export interface IReason extends Document {
  name: string;
  createdAt: Date;
}

export const reasonSchema: Schema<IReason> = new Schema({
  name: { type: String, required: true, index: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

reasonSchema.index({ name: 1 }, { unique: true });

export const Reason = mongoose.model<IReason>('Reason', reasonSchema);

export default Reason;
