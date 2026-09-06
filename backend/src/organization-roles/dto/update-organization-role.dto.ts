import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateOrganizationRoleDto {

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;


  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string | null;

}