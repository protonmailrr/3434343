/**
 * Relations Model - PLACEHOLDER
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IRelations extends Document {
  createdAt: Date;
  updatedAt: Date;
}

const RelationsSchema = new Schema<IRelations>(
  {},
  { timestamps: true }
);

export const RelationsModel = mongoose.model<IRelations>('Relations', RelationsSchema);
