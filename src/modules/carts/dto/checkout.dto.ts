import {
  IsOptional,
  IsString,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GuestInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value || undefined)
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  firstName: string;

  @ApiPropertyOptional()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CheckoutDto {
  @ApiPropertyOptional({ description: 'Existing customer ID. Takes precedence over guest info.' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ type: GuestInfoDto, description: 'Guest customer info. Used if no customerId.' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GuestInfoDto)
  guest?: GuestInfoDto;

  @ApiPropertyOptional({ description: 'Existing customer address ID for shipping' })
  @IsOptional()
  @IsString()
  shippingAddressId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
