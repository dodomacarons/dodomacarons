import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IManufacturingWasteReason {
  reason: Types.ObjectId;
}

export interface IWaste extends Document {
  manufacturingDate: Date;
  releaseDate: Date;
  displayDate: Date;
  flavor: Types.ObjectId;
  displayedQuantity: number;
  manufacturingWasteQuantity: number;
  manufacturingWasteReason?: IManufacturingWasteReason[];
  shippingWasteQuantity: number;
  createdAt: Date;
  updatedAt?: Date | null;
  comment?: string;
}

export const manufacturingWasteReasonSchema =
  new Schema<IManufacturingWasteReason>(
    {
      reason: { type: Schema.Types.ObjectId, ref: 'Reason', required: true },
    },
    { _id: false },
  );

export const wasteSchema: Schema<IWaste> = new Schema({
  manufacturingDate: { type: Date, required: true },
  releaseDate: { type: Date, required: true },
  displayDate: { type: Date, required: true, index: true },
  flavor: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'Flavor',
  },
  displayedQuantity: { type: Number, required: true },
  manufacturingWasteQuantity: { type: Number, required: true },
  manufacturingWasteReason: [manufacturingWasteReasonSchema],
  shippingWasteQuantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  comment: { type: String },
});

export const Waste = mongoose.model<IWaste>('Waste', wasteSchema);

export default Waste;
