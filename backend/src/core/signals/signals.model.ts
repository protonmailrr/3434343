/**
 * Signals Model - PLACEHOLDER
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface ISignals extends Document {
  createdAt: Date;
  updatedAt: Date;
}

const SignalsSchema = new Schema<ISignals>(
  {},
  { timestamps: true }
);

export const SignalsModel = mongoose.model<ISignals>('Signals', SignalsSchema);
