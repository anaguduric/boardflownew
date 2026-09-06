import {
  IsArray,
  IsInt,
} from 'class-validator';

export class UpdateRolePermissionsDto {

  @IsArray()
  @IsInt({
    each: true,
  })
  permission_ids!: number[];

}