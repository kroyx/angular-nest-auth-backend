import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from "@nestjs/mongoose";

import * as bcryptjs from "bcryptjs";
import { Model } from "mongoose";
import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';
import { User } from "./entities/user.entity";
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login.response';


@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // 1- Encriptar la contraseña
      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData,
      });

      // 2- Guardar el usuario
      await newUser.save();
      const { password: _, ...user } = newUser.toJSON();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }
      throw new InternalServerErrorException("Something went wrong");
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Not valid credentials - user does not exist');
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password is wrong');
    }

    const { password: _, ...rest } = user.toJSON();
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {
    const userData = await this.create({
      email: registerUserDto.email,
      name: registerUserDto.name,
      password: registerUserDto.password,
    });
    const loginDto: LoginDto = {
      email: registerUserDto.email,
      password: registerUserDto.password,
    };
    return this.login(loginDto);
  }

  async checkToken(user: User): Promise<LoginResponse> {
    return {
      user,
      token: this.getJwtToken({ id: user._id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
