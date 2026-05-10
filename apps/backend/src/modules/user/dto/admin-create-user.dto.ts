import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminCreateUserDto {
  @ApiProperty({
    example: 'Your Name',
    description: 'The name of the user',
  })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'youremail@gmail.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'The password of the user',
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Role ID to assign to user',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roleId?: number;

  @ApiPropertyOptional({
    example: 'Short bio',
    description: 'User bio',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: '+123456789',
    description: 'User phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  avatar?: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  background?: any;
}
