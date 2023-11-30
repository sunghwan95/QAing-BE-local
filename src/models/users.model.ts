import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaOptions, Types } from 'mongoose';
import { Video } from './videos.model';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
  })
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userPhoneNumber: string;

  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userJob: string;

  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userTeamsize: string;

  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userCompany: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: false, type: [{ type: Types.ObjectId, ref: 'Video' }] })
  videos: Video[];
}

export const UserSchema = SchemaFactory.createForClass(User);
