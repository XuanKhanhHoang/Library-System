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
      let { pass_word, id_user, reader } =
        await this.prismaService.user.findFirstOrThrow({
          where: {
            user_name: userName,
            is_valid: true,
            is_librian: isManager,
          },
          select: {
            pass_word: true,
            id_user: true,
            reader: {
              select: {
                name: true,
                avatar: true,
                gender: true,
                job_title: {
                  select: {
                    job_title_name: true,
                  },
                },
              },
            },
          },
        }); //P2025
      if (!pass_word) throw new InternalServerErrorException();
      if (!(await bcrypt.compare(userLoginPassword, pass_word)))
        throw new UnauthorizedException();
      let access_token = await this.jwtService.signAsync({
        id_user: id_user,
        is_librian: isManager,
      });
      if (!isManager)
        return {
          access_token,
          user_info: {
            id_user: id_user,
            avatar: reader.avatar,
            name: reader.name,
            gender: reader.gender,
            job_title: reader.job_title.job_title_name,
          },
        };
      return {
        access_token,
        user_info: {
          id_user: id_user,
        },
      };
    } catch (e) {
      if (e.code == 'P2025') throw new NotFoundException();
      throw e;
    }
  }
}
