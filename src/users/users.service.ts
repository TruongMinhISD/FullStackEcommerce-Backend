import { Injectable } from '@nestjs/common';
import { CreateUserDto, Role } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  comparePassword,
  generateHashPassword,
} from 'src/shared/utility/password-manager';
import { sendMail } from 'src/shared/utility/sendEmail';
import { generateAuthToken } from 'src/shared/utility/generate-token';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      // Tạo passWord hash
      createUserDto.password = await generateHashPassword(
        createUserDto.password,
      );
      // check admin
      if (
        createUserDto.type === Role.ADMIN &&
        createUserDto.secretToken !== process.env.ADMIN_SECRET_TOKEN
      ) {
        throw new Error('Not allow to create admin');
      } else if (createUserDto.type !== Role.CUSTOMER) {
        createUserDto.isVerified = true;
      } else createUserDto.isVerified = false;
      // Check đã tồn tại tài khoản
      const user = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });
      if (user) {
        throw new Error('Tài khoản đã tồn tại');
      }
      // generate OTP
      const otp = Math.floor(Math.random() * 900000) + 100000;
      const otpExpiryTime = new Date();
      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10);

      const newUser = await this.userRepository.save({
        ...createUserDto,
        otp: String(otp),
        otpExpiryTime: otpExpiryTime,
      });

      if (newUser.type !== Role.ADMIN) {
        newUser.email, otp;
        await sendMail(newUser.email, 'Xác nhận đăng ký tài khoản', `${otp}`);
      }

      return {
        success: true,
        message:
          newUser.type === Role.ADMIN
            ? 'Tạo tài khoản Admin thành công'
            : 'Vui lòng kiểm tra email để nhận mã OTP',
        result: { email: newUser.email },
      };
    } catch (error) {
      console.log(error);
    }
  }

  async login(email: string, passWord: string) {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email: email },
      });
      if (!userExists) {
        throw new Error('Tài khoản không tồn tại');
      }
      if (!userExists.isVerified) {
        throw new Error('Email chưa xác thực');
      }
      const isMatch = await comparePassword(passWord, userExists.password);
      if (!isMatch) {
        throw new Error('Mật khẩu không chính xác');
      }
      const token = await generateAuthToken(String(userExists.id));
      return {
        success: true,
        message: 'Đăng nhập thành công',
        result: {
          user: {
            name: userExists.name,
            email: userExists.email,
            type: userExists.type,
            id: String(userExists.id),
          },
          token,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
