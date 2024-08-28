import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  user_name: string;

  @IsNotEmpty()
  @MinLength(8)
  pass_word: string;
}

export type LoginResultDTO =
  | {
      access_token: string;
      user_info: {
        id_user: number;
        avatar: string;
        name: string;
        gender: boolean;
        job_title: string;
      };
    }
  | {
      access_token: string;
      user_info: {
        id_user: number;
      };
    };
