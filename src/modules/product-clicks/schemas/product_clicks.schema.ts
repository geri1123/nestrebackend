import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductClickDocument = ProductClick & Document;

@Schema({ timestamps: true })
export class ProductClick {
  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ default: 1 })
  count!: number;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const ProductClickSchema = SchemaFactory.createForClass(ProductClick);

// Indexes for fast analytics queries
// Compound: query "find clicks for these products in last N days"
ProductClickSchema.index({ productId: 1, createdAt: -1 });
// For dedupe window check
ProductClickSchema.index({ productId: 1, userId: 1, createdAt: -1 });
ProductClickSchema.index({ productId: 1, ipAddress: 1, createdAt: -1 });