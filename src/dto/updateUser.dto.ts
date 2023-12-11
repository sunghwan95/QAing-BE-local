import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  userProfileImg: string;

  @IsNotEmpty()
  userPhoneNumber: string | null;

  @IsNotEmpty()
  userJob: string | null;

  @IsNotEmpty()
  userTeamsize: string | null;

  @IsNotEmpty()
  userCompany: string | null;
}
