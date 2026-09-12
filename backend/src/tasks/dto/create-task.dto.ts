import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTaskDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  status_id!: number;

  @IsDateString()
  due_date!: string;

  @IsInt()
  assigned_to!: number;

  @IsInt()
  project_id!: number;
}