import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, LoginResultDTO } from './dto/auth.dto';
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
}
