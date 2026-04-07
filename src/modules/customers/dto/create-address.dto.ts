import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType } from '@prisma/client';

export class CreateAddressDto {
  @ApiProperty({ enum: AddressType, description: 'Address type (SHIPPING or BILLING)' })
  @IsEnum(AddressType)
  type: AddressType;

  @ApiProperty({ description: 'First name for this address' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: 'Last name for this address' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ description: 'Primary address line' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  addressLine1: string;

  @ApiPropertyOptional({ description: 'Secondary address line (apt, suite, etc.)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city: string;

  @ApiProperty({ description: 'Postal / ZIP code' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({ description: 'Country (ISO code or full name)' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({ description: 'Phone number for this address' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Set as default address for this type', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
