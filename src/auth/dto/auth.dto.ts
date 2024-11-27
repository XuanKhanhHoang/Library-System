import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ValidOTP } from '../decorators/validOTP.decorator';

export class OTPAuthForgotPassword {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ValidOTP()
  otp: number;
}

export class EmailDTO {
  @IsEmail()
  email: string;
}
export class LoginDTO {
  @IsNotEmpty()
  user_name: string;

  @IsNotEmpty()
  @MinLength(6)
  pass_word: string;
}

export type LoginResultDTO = {
  access_token: {
    token: string;
    iat: number;
    exp: number;
  };
  user_info: {
    id_user: number;
    avatar: string;
    name: string;
    user_name: string;
  };
};
