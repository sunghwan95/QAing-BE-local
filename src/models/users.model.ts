import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaOptions, Types } from 'mongoose';
import { ShortVideo } from './shorts.model';
import { Image } from './image.model';

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

  @Prop({
    required: false,
    type: [{ type: Types.ObjectId, ref: 'ShortVideo' }],
  })
  shorts: ShortVideo[];

  @Prop({
    required: false,
    type: [{ type: Types.ObjectId, ref: 'Image' }],
  })
  images: Image[];
}

export const UserSchema = SchemaFactory.createForClass(User);
