import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, UpdateUserDto } from './dto';
import { GetUser } from "../auth/decorators/get-user.decorator"
import { Users } from './entities/user.entity';
import { Auth } from './decorators/auth-decorator';
import { ValidRoles } from './interface/valid-roles';
import { ApiTags } from '@nestjs/swagger';
@ApiTags("auth")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post("login")
  loginUser(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get("check-status")
  @Auth()
  checkStatus(@GetUser() user: Users) {
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @Auth(ValidRoles.admin)
  testinPrivateRouter(@GetUser() user: Users) {
    return {
      user
    }
  }

}
