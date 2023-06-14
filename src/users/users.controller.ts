import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from 'src/shared/middleware/role.decorators';
import { CreateUserDto, Role } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUser: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const loginRes = await this.usersService.login(
      loginUser.email,
      loginUser.password,
    );
    if (loginRes.success) {
      response.cookie('_digi_auth_token', loginRes.result?.token, {
        httpOnly: true,
      });
    }
    delete loginRes.result?.token;
    return loginRes;
  }

  @Get('/verify-email/:otp/:email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Param('otp') otp: string, @Param('email') email: string) {
    return await this.usersService.verifyEmail(email, otp);
  }

  @Get('/resend-otp/:email')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Param('email') email: string) {
    return await this.usersService.resendOtp(email);
  }

  @Put('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res() response: Response) {
    response.clearCookie('_digi_auth_token');
    return response.json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  }
  // reset password
  // Quên mật khẩu
  @Get('/reset-password/:email')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Param('email') email: string) {
    return await this.usersService.resetPassword(email);
  }

  // Update name and password
  @Patch('/update-name-password/:id')
  @HttpCode(HttpStatus.OK)
  async updateNamePassword(
    @Param('id') id: string,
    @Body() updateNamePassword: UpdateUserDto,
  ) {
    return await this.usersService.updateNamePassword(id, updateNamePassword);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query('type') type: string) {
    return this.usersService.findAll(type);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
