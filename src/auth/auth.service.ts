import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginDTO,
  LoginResultDTO,
  OTPAuthForgotPassword,
} from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { Role } from './roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}
  private mailer_name = `"UTC LIB SYSTEM " <Khanhpopo056@gmail.com>`;
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
  public async createOTP(otp_type: number, email: string, validTime = 900000) {
    //900000ms = 15'
    const min = 100000;
    const max = 999999;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    let currentTime = new Date().getTime();
    let timezoneOffset = new Date().getTimezoneOffset() * 60000;
    let invalidTime = new Date(currentTime - timezoneOffset + validTime);
    const data = await this.prismaService.otp_code_queue.create({
      data: {
        code: otp,
        email: email,
        otp_code_type: otp_type,
        invalid_time: invalidTime,
      },
      select: {
        code: true,
        id: true,
      },
    });
    return data;
  }
  async GetOTPtoForgotPassword(email: string) {
    try {
      const res = await this.prismaService.user.findFirst({
        where: {
          email: email,
          is_valid: true,
          is_librian: false,
        },
        select: {
          user_name: true,
        },
      });
      if (!res) throw new NotFoundException('user not found');
      const otp_code_type_reset_password = 1;
      const { code: otp } = await this.createOTP(
        otp_code_type_reset_password,
        email,
      );
      let a = await this.mailerService.sendMail({
        from: 'this.mailer_name', // sender address
        to: email, // list of receivers
        subject: 'Quên mật khẩu cho tài khoản ' + res.user_name, // Subject line
        text: `Vui lòng nhập OTP là : ${otp}`, // plain text body
        html: `Mã OTP cho việc quên mật khẩu của bạn là :${otp} ,mã này hết hạn trong 15 phút.`, // html body
      });
      return {
        success: true,
      };
    } catch (e) {
      console.log(e);
      if (e.status == 404) throw e;
      throw new ServiceUnavailableException();
    }
  }
  async GetForgotPasswordLink(email: string) {
    const res = await this.prismaService.user.findFirst({
      where: {
        email: email,
        is_valid: true,
        is_librian: false,
      },
      select: {
        user_name: true,
        id_user: true,
      },
    });
    if (!res) throw new NotFoundException('user not found');
    const access_token = await this.jwtService.signAsync({
      id_user: res.id_user,
      is_librian: false,
    });
    const makeChangePasswordLink = (access_token: string, email: string) =>
      `http://localhost:3000/auth/reset_password?access_token=${encodeURIComponent(
        access_token,
      )}&email=${encodeURI(email)}`;
    try {
      await this.mailerService.sendMail({
        from: this.mailer_name, // sender address
        to: email, // list of receivers
        subject: 'Quên mật khẩu cho tài khoản ' + res.user_name, // Subject line
        text: `Vui lòng click vào link dưới để thay đổi mật khẩu`, // plain text body
        html: `<a href="${makeChangePasswordLink(access_token, email)}" style="
      text-decoration: none;
      padding: 12px;
      color: WHITE;
      background-color: #6af86a;
      text-align: center;
      margin: 0 auto;
      width: 40%;
      display: block;
      border-radius: 5px;
      font-size: 0.9rem;
  ">Click vào đây để thay đổi mật khẩu </a>
      <div>Link này hết hạn trong 2 giờ.</div>
  `, // html body
      });
      return {
        success: true,
      };
    } catch (e) {
      console.log(e);
      if (e.status == 404) throw e;
      throw new ServiceUnavailableException();
    }
  }
  async AuthForgotPasswordOTP(data: OTPAuthForgotPassword) {
    const otp_code = Number(data.otp);
    const { email } = data;
    const res = await this.prismaService.otp_code_queue.findFirst({
      where: {
        code: otp_code,
        email: email,
      },
    });
    if (!res) {
      throw new NotFoundException('OTP not found');
    }
    if (!res.is_valid) {
      throw new BadRequestException('OTP has been authenticated');
    }
    let currentTime = new Date().getTime();
    let timezoneOffset = new Date().getTimezoneOffset() * 60000;
    let localCurrentTime = new Date(currentTime - timezoneOffset);
    if (res.invalid_time.getTime() < localCurrentTime.getTime()) {
      throw new BadRequestException('OPT expired');
    }
    await this.prismaService.otp_code_queue.update({
      where: {
        id: res.id,
      },
      data: {
        is_valid: false,
      },
    });
    const { id_user } = await this.prismaService.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id_user: true,
      },
    });
    let access_token = await this.jwtService.signAsync({
      id_user,
      role: Role.User,
    });
    return {
      access_token: access_token,
    };
  }
}
