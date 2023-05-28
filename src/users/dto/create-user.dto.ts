import {
  ArrayContains,
  Contains,
  IsEmail,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  validate,
} from 'class-validator';

export enum Role {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export class CreateUserDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tên' })
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Role)
  type: string;

  @IsString()
  @IsOptional()
  secretToken?: string;

  isVerified?: boolean;

  otp: string;
  otpExpiryTime: string;
}
