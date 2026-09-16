import {
  IsEmail,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class CreateOrganizationInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsInt()
  roleId!: number;
}