
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductClickDocument = ProductClick & Document;

@Schema({ timestamps: true }) 
export class ProductClick {
  @Prop({ required: true })
  productId: string; 

  @Prop({ required: true })
  userId: string;

  @Prop({ default: 1 })
  count: number; 

  @Prop()
  ipAddress?: string; 

  @Prop()
  userAgent?: string; 
}
export const ProductClickSchema = SchemaFactory.createForClass(ProductClick);