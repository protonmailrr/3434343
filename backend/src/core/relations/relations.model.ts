/**
 * Relations MongoDB Model
 * Aggregated connections between entities
 * 
 * NOT a transaction log!
 * This is a compressed analysis result:
 * "Between A and B there are X interactions over period T
 *  with direction, density, and type"
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Entity types that can be connected
 */
export type EntityType = 'actor' | 'entity' | 'wallet' | 'token';

/**
 * Direction of the relation
 */
export type Direction = 'in' | 'out' | 'bidirectional';

/**
 * Relation Document Interface
 */
export interface IRelation extends Document {
  _id: Types.ObjectId;
  
  // Connected entities
  from: Types.ObjectId | string;
  to: Types.ObjectId | string;
  fromType: EntityType;
  toType: EntityType;
  
  // Flow direction
  direction: Direction;
  
  // Aggregated metrics
  interactionCount: number;
  volumeUSD: number;
  
  // Key metrics for visualization
  densityScore: number;      // Main metric - corridor thickness
  influenceWeight: number;   // Weight for influence graph
  
  // Time bounds
  firstSeenAt: Date;
  lastSeenAt: Date;
  
  // Classification
  tags: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Relation Schema
 */
const RelationSchema = new Schema<IRelation>(
  {
    // From entity
    from: {
      type: Schema.Types.Mixed, // ObjectId or string (address)
      required: true,
      index: true,
    },
    
    // To entity
    to: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    
    // Entity types
    fromType: {
      type: String,
      enum: ['actor', 'entity', 'wallet', 'token'],
      required: true,
      index: true,
    },
    toType: {
      type: String,
      enum: ['actor', 'entity', 'wallet', 'token'],
      required: true,
      index: true,
    },
    
    // Direction
    direction: {
      type: String,
      enum: ['in', 'out', 'bidirectional'],
      required: true,
    },
    
    // Aggregated metrics
    interactionCount: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    volumeUSD: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    
    // Key metrics
    densityScore: {
      type: Number,
      required: true,
      default: 1,
      index: true,
    },
    influenceWeight: {
      type: Number,
      required: true,
      default: 1,
      index: true,
    },
    
    // Time bounds
    firstSeenAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      required: true,
      index: true,
    },
    
    // Tags for classification
    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'relations',
  }
);

/**
 * Compound indexes for efficient queries
 */
// Unique relation between two entities
RelationSchema.index(
  { from: 1, to: 1, fromType: 1, toType: 1 },
  { unique: true }
);

// For graph traversal
RelationSchema.index({ from: 1, densityScore: -1 });
RelationSchema.index({ to: 1, densityScore: -1 });

// For filtering by type and density
RelationSchema.index({ fromType: 1, toType: 1, densityScore: -1 });

// For time-based queries
RelationSchema.index({ lastSeenAt: -1, densityScore: -1 });

// For influence calculations
RelationSchema.index({ influenceWeight: -1 });

// For tag-based filtering
RelationSchema.index({ tags: 1, densityScore: -1 });

export const RelationModel = mongoose.model<IRelation>('Relation', RelationSchema);
