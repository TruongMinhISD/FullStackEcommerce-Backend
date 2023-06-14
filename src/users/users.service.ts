import { Injectable } from '@nestjs/common';
import { CreateUserDto, Role } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './Entities/user.entity';
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

  // Tạo tài khoản người dùng
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
      throw error.message;
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
      throw error.message;
    }
  }

  async verifyEmail(email: string, otp: string) {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email: email },
      });
      if (!userExists) {
        throw new Error('Email chưa được đăng ký');
      }
      if (otp !== userExists.otp) {
        throw new Error('Mã OTP không chính xác');
      }

      if (userExists.otpExpiryTime < new Date()) {
        throw new Error('OTP đã hết hạn');
      }
      await this.userRepository.update({ email }, { isVerified: true });
      return {
        success: true,
        message: 'Email đã được xác nhận thành công',
      };
    } catch (error) {
      throw error.message;
    }
  }

  async resendOtp(email: string) {
    try {
      const userExists = await this.userRepository.findOneBy({ email: email });

      if (email !== userExists.email) {
        throw new Error('Email chưa đăng ký tài khoản');
      }

      const otp = Math.floor(Math.random() * 900000) + 100000;
      const otpExpiryTime = new Date();
      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10);

      await this.userRepository.update(
        { email },
        {
          otp: otp.toString(),
          otpExpiryTime: otpExpiryTime,
        },
      );

      sendMail(email, 'Xác nhận đăn ký tài khoản', `${otp}`);

      return {
        success: true,
        message: 'Email xác nhận đã được gửi vui lòng kiểm tra',
      };
    } catch (error) {
      throw error.message;
    }
  }

  // Quên mật khẩu
  async resetPassword(email: string) {
    try {
      const user = await this.userRepository.findOneBy({ email: email });
      if (!user) {
        throw new Error('Email không tồn tại');
      }
      let password = Math.random().toString(36).substring(2, 12);
      const tempPassword = password;
      password = await generateHashPassword(password);

      await this.userRepository.update(
        { email },
        {
          password: password,
        },
      );
      sendMail(email, 'Mật khẩu mới', `${tempPassword}`);
      return {
        success: true,
        message: 'Mật khẩu mới đã được gửi về email vui lòng kiểm tra!',
      };
    } catch (error) {
      throw error.message;
    }
  }

  // Đổi tên và mật khẩu
  async updateNamePassword(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id: id });
      if (!user) {
        throw new Error('Tài khoản không tồn tại');
      }
      if (!user.isVerified) {
        throw new Error('Email chưa xác nhận');
      }
      const compare = await comparePassword(
        updateUserDto.password,
        user.password,
      );
      if (!compare) {
        throw new Error('Mật khẩu không chính xác');
      }
      if (updateUserDto.newPassword === updateUserDto.password) {
        throw new Error('Vui lòng chọn mật khẩu khác mật khẩu cũ');
      }

      const tempPassword = await generateHashPassword(
        updateUserDto.newPassword,
      );
      await this.userRepository.update(
        { id },
        {
          id: id,
          name: updateUserDto.name,
          password: tempPassword,
        },
      );

      return {
        success: true,
        message: 'Đổi tên và mật khẩu thành công',
      };
    } catch (error) {
      throw error.message;
    }
  }

  async findAll(type: string) {
    try {
      const user = await this.userRepository.findBy({ type: type });
      return {
        success: true,
        message: 'Tìm thành công',
        result: user,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id?: string, email?: string) {
    if (id) {
      return await this.userRepository.findOne({
        where: {
          email: id,
        },
      });
    }
    if (email) {
      return await this.userRepository.findOneBy({ email });
    }
    throw new Error(`Không tìm thấy tài khoản`);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
