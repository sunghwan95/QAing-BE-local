import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Video extends Document {
  @Prop({ required: true })
  originalVideoUrl: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ShortVideo' }] })
  shortVideos: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Image' }] })
  images: Types.ObjectId[];
}

export const VideoSchema = SchemaFactory.createForClass(Video);
