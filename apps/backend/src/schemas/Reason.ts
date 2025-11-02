import mongoose, { Schema, Document } from 'mongoose';
import { EProductType } from './Waste';

export interface IReason extends Document {
  name: string;
  createdAt: Date;
  productType: EProductType
}

export const reasonSchema: Schema<IReason> = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  productType: { type: String, enum: Object.values(EProductType), required: true }
});

export const Reason = mongoose.model<IReason>('Reason', reasonSchema);

export default Reason;
