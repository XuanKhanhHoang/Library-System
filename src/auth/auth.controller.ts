import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, LoginResultDTO } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  async Login(@Body() body: LoginDTO): Promise<LoginResultDTO> {
    return this.authService.Login(body);
  }

  @Post('manager_login')
  async ManagerLogin(@Body() body: LoginDTO) {
    return this.authService.Login(body, true);
  }
}
