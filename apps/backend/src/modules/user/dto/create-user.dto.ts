import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Your Name',
    description: 'The name of the user',
    required: true,
  })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'youremail@gmail.com',
    description: 'The email of the user',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'The password of the user',
    required: true,
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
