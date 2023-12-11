//folders.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaOptions } from 'mongoose';
import { IssueFile } from './issueFiles.model';

const options: SchemaOptions = {
  timestamps: true,
};
@Schema(options)
export class Folder extends Document {
  @Prop()
  folderName: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'IssueFile' }] })
  issues: IssueFile[];
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
