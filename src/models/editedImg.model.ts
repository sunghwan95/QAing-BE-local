//issueFiles.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types } from 'mongoose';

const options: SchemaOptions = {
  timestamps: true,
};
@Schema(options)
export class EditedImg extends Document {
  @Prop()
  editedImgName: string;

  @Prop()
  editedImgUrl: string;

  @Prop()
  owner: string;
}

export const EditedImgSchema = SchemaFactory.createForClass(EditedImg);
