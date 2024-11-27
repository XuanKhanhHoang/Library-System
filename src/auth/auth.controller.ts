import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  EmailDTO,
  LoginDTO,
  LoginResultDTO,
  OTPAuthForgotPassword,
} from './dto/auth.dto';
import { RequestObject } from './dto/request.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  async Login(@Body() body: LoginDTO): Promise<LoginResultDTO> {
    return this.authService.Login(body);
  }

  @Post('manager_login')
  async ManagerLogin(@Body() body: LoginDTO): Promise<LoginResultDTO> {
    return this.authService.Login(body, true);
  }
  @Get('auth_token')
  async AuthToken(@Req() req: RequestObject) {
    const { user } = req;
    return this.authService.AuthToken(user);
  }
  @Post('get_otp_to_forgot_password')
  async GetOTPtoForgotPassword(@Body() body: EmailDTO) {
    return this.authService.GetOTPtoForgotPassword(body.email);
  }
  @Post('get_forgot_password_link')
  async GetForgotPasswordLink(@Body() body: EmailDTO) {
    return this.authService.GetForgotPasswordLink(body.email);
  }
  @Post('otp_forgot_password')
  OTPAuthForgotPassword(@Body() data: OTPAuthForgotPassword) {
    return this.authService.AuthForgotPasswordOTP(data);
  }
}
