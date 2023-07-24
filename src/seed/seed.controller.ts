import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ValidRoles } from 'src/auth/interface/valid-roles';
import { Auth } from 'src/auth/decorators/auth-decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Users } from 'src/auth/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';


@Controller('seed')
@ApiTags("carga data")
export class SeedController {
  constructor(private readonly seedService: SeedService) { }

  @Get()
  @Auth(ValidRoles.user)
  executeSeed(@GetUser() user: Users) {
    this.seedService.runSeed(user);
  }

}
