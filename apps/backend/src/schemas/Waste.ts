import mongoose, { Schema, Document } from 'mongoose';

interface IManufacturingWasteReason {
  reason: string;
}

interface IWaste extends Document {
  manufacturingDate: Date;
  releaseDate: Date;
  displayDate: Date;
  flavor: string;
  releasedQuantity: number;
  manufacturingWasteQuantity: number;
  manufacturingWasteReason?: IManufacturingWasteReason[];
  shippingWasteQuantity: number;
  createdAt: Date;
}

const manufacturingWasteReasonSchema = new Schema<IManufacturingWasteReason>(
  {
    reason: { type: String, required: true },
  },
  { _id: false }
);

const wasteSchema: Schema<IWaste> = new Schema({
  manufacturingDate: { type: Date, required: true },
  releaseDate: { type: Date, required: true },
  displayDate: { type: Date, required: true },
  flavor: { type: String, required: true },
  releasedQuantity: { type: Number, required: true },
  manufacturingWasteQuantity: { type: Number, required: true },
  manufacturingWasteReason: [manufacturingWasteReasonSchema],
  shippingWasteQuantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Waste = mongoose.model<IWaste>('Waste', wasteSchema);

export default Waste;
