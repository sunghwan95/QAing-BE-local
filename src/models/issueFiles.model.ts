//issueFiles.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types } from 'mongoose';
import { EditedImg } from './editedImg.model';

const options: SchemaOptions = {
  timestamps: true,
};
@Schema(options)
export class IssueFile extends Document {
  @Prop()
  issueName: string;

  @Prop()
  imageUrl: string;

  @Prop()
  videoUrl: string;

  @Prop({})
  folder: string;

  @Prop({})
  owner: string;

  @Prop({ type: Types.ObjectId })
  editedImage: EditedImg;

  @Prop({})
  capturedImageUrls: string[];
}

export const IssueFileSchema = SchemaFactory.createForClass(IssueFile);
