import mongoose, { Schema, Document } from 'mongoose';

export interface IFlavor extends Document {
  name: string;
  createdAt: Date;
}

export const flavorSchema: Schema<IFlavor> = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

flavorSchema.index({ name: 1 }, { unique: true });

export const Flavor = mongoose.model<IFlavor>('Flavor', flavorSchema);

export default Flavor;
