import mongoose, { Schema, Document } from 'mongoose';
import { EProductType } from './Waste';

export interface IFlavor extends Document {
  name: string;
  createdAt: Date;
  productType: EProductType;
}

export const flavorSchema: Schema<IFlavor> = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  productType: { type: String, enum: Object.values(EProductType), required: true }
});

export const Flavor = mongoose.model<IFlavor>('Flavor', flavorSchema);

export default Flavor;
