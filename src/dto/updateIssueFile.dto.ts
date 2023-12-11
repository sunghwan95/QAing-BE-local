import { IsNotEmpty } from 'class-validator';

export class UpdateIssueFileDto {
  @IsNotEmpty()
  newIssueName: string;
}
