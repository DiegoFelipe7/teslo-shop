import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt"
import { LoginDto } from './dto';
import { JwtPayload } from './interface/jwt.payload.interface';
import { JwtService } from "@nestjs/jwt"
@Injectable()
export class AuthService {

  constructor(@InjectRepository(Users) private readonly userRepository: Repository<Users>, private readonly jwtService: JwtService) {

  }
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwToken({ id: user.id })
      }
    } catch (error) {
      this.handlerError(error)
    }
  }

  async login(login: LoginDto) {

    const { email, password } = login;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    })
    if (!user) throw new UnauthorizedException("Credential are not valid (email")
    if (bcrypt.compareSync(password, user.password)) throw new UnauthorizedException("Credential are not valid (password")
    return {
      ...user,
      token: this.getJwToken({ id: user.id })
    };

  }

  async checkAuthStatus(user: Users) {
    return {
      ...user,
      token: this.getJwToken({ id: user.id })

    }
  }

  private getJwToken(paylod: JwtPayload) {
    return this.jwtService.sign(paylod);
  }


  private handlerError(error: any): never {
    if (error.code === "23505")
      throw new BadRequestException("El usuario ya se encuentra registrado")
    throw new InternalServerErrorException("Error en el servidor")
  }
}
