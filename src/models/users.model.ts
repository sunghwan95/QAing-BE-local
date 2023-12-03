import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaOptions, Types } from 'mongoose';
import { Video } from './videos.model';

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

  @Prop()
  refreshToken?: string;

  @Prop({ required: false, type: [{ type: Types.ObjectId, ref: 'Video' }] })
  videos: Video[];
}

export const UserSchema = SchemaFactory.createForClass(User);
