//users.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaOptions, Types } from 'mongoose';
import { Folder } from './folders.model';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class User extends Document {
  @Prop()
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @Prop()
  @IsString()
  @IsNotEmpty()
  userName: string;

  @Prop()
  @IsNotEmpty()
  userPhoneNumber: string | null;

  @Prop()
  userProfileImg: string | null;

  @Prop()
  @IsNotEmpty()
  userJob: string | null;

  @Prop()
  @IsNotEmpty()
  userTeamsize: string | null;

  @Prop()
  @IsNotEmpty()
  userCompany: string | null;

  @Prop()
  accessToken: string | null;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Folder' }],
  })
  folders: Folder[];
}

export const UserSchema = SchemaFactory.createForClass(User);
