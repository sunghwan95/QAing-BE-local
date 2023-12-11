import { IsNotEmpty } from 'class-validator';
import { IssueFile } from 'src/models/issueFiles.model';

export class UpdateFolderDto {
  @IsNotEmpty()
  newFolderName: string;

  IssueFiles: IssueFile[];
}
