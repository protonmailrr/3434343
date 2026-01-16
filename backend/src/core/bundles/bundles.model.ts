/**
 * Bundles Model - PLACEHOLDER
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IBundles extends Document {
  createdAt: Date;
  updatedAt: Date;
}

const BundlesSchema = new Schema<IBundles>(
  {},
  { timestamps: true }
);

export const BundlesModel = mongoose.model<IBundles>('Bundles', BundlesSchema);
