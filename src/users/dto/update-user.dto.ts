import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tên' })
  @IsString({ message: 'Tên không có ký tự đặt biệt' })
  name?: string;
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu cũ' })
  password?: string;
  @Length(6, 12)
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu mới' })
  newPassword?: string;
}
