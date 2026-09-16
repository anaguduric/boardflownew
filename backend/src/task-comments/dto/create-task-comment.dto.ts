import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  comment_text!: string;
}