//issueFiles.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';
import * as mongoose from 'mongoose';

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

  @Prop({ type: mongoose.Schema.Types.Mixed })
  editedImage: {
    editedImageName: string;
    editedImageUrl: string;
  };

  @Prop({})
  capturedImageUrls: string[];
}

export const IssueFileSchema = SchemaFactory.createForClass(IssueFile);
