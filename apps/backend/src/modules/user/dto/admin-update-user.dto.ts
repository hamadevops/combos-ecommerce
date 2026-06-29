import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, MinLength, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({
    example: 'Updated Name',
    description: 'The name of the user',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'newemail@gmail.com',
    description: 'The email of the user',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    description: 'New password (optional)',
  })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Role ID to assign to user',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roleId?: number;

  @ApiPropertyOptional({
    example: 'A short bio',
    description: 'User bio',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  avatar?: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  background?: any;
}
