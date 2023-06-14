import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NextFunction, Request, Response } from 'express';
import { Users } from 'src/users/Entities/user.entity';
import { Repository } from 'typeorm';
import { decodeAuthToken } from '../utility/generate-token';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async use(req: Request | any, res: Response, next: NextFunction) {
    try {
      const token = req.cookies._digi_auth_token;
      if (!token) {
        throw new UnauthorizedException('Missing auth token');
      }
      const decodeData = decodeAuthToken(token);
      const user = await this.usersRepository.findOneBy({ id: decodeData.id });
      if (!user) {
        throw new UnauthorizedException('Unauthorized');
      }
      user.password = undefined;
      req.user = user;
      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
