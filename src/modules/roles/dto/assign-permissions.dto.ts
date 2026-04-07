import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionsDto {
  @ApiProperty({ type: [String], example: ['perm_id_1', 'perm_id_2'] })
  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}
