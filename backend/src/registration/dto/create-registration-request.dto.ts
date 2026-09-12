import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateRegistrationRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  first_name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  last_name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  organization_name!: string;

  @IsOptional()
  @IsString()
  organization_description?: string;
}