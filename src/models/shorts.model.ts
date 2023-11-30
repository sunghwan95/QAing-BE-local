import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Shorts extends Document {
  @Prop({ required: true })
  url: string;
}

export const ShortsVideoSchema = SchemaFactory.createForClass(Shorts);
