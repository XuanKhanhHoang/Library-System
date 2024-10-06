import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDTO, LoginResultDTO } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async Login(body: LoginDTO, isManager = false): Promise<LoginResultDTO> {
    let { pass_word: userLoginPassword, user_name: userName } = body;
    userName = userName.toLocaleLowerCase();
    try {
      let { pass_word, id_user, avatar, name, user_name } =
        await this.prismaService.user.findFirstOrThrow({
          where: {
            user_name: userName,
            is_valid: true,
            is_librian: isManager,
          },
          select: {
            pass_word: true,
            id_user: true,
            avatar: true,
            name: true,
            user_name: true,
          },
        }); //P2025
      if (!pass_word) throw new InternalServerErrorException();
      if (!(await bcrypt.compare(userLoginPassword, pass_word)))
        throw new UnauthorizedException('');
      let access_token = await this.jwtService.signAsync({
        id_user: id_user,
        is_librian: isManager,
      });
      const now = new Date();
      now.setHours(now.getHours() + 1);
      return {
        access_token: {
          token: access_token,
          iat: new Date().getTime(),
          exp: now.getTime(),
        },
        user_info: {
          id_user: id_user,
          avatar: avatar,
          name: name,
          user_name: user_name,
        },
      };
    } catch (e) {
      if (e.code == 'P2025') throw new UnauthorizedException('');
      throw e;
    }
  }
  async AuthToken({
    id_user,
    is_librian,
  }: {
    id_user: number;
    is_librian: boolean;
  }) {
    let access_token = await this.jwtService.signAsync({
      id_user: id_user,
      is_librian: is_librian,
    });
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return {
      access_token: {
        token: access_token,
        iat: new Date().getTime(),
        exp: now.getTime(),
      },
    };
  }
}
