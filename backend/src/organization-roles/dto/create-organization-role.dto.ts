import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrganizationRoleDto {

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}