import { IsNotEmpty } from 'class-validator';

export class UpdateImageDto {
  @IsNotEmpty()
  originImageUrl: string;

  editedImageUrl: string | null | undefined;
}
