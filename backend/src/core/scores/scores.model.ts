/**
 * Scores Model - PLACEHOLDER
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IScores extends Document {
  createdAt: Date;
  updatedAt: Date;
}

const ScoresSchema = new Schema<IScores>(
  {},
  { timestamps: true }
);

export const ScoresModel = mongoose.model<IScores>('Scores', ScoresSchema);
