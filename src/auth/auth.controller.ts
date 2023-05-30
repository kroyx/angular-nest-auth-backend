import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginDto, RegisterUserDto } from './dto';
import { AuthGuard } from './guard/auth.guard';

@Controller("auth")
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  // @Get(":id")
  // findOne(@Param("id") id: string) {
  //   return this.authService.findOne(+id);
  // }
  //
  // @Patch(":id")
  // update(@Param("id") id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }
  //
  // @Delete(":id")
  // remove(@Param("id") id: string) {
  //   return this.authService.remove(+id);
  // }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }


  @UseGuards(AuthGuard)
  @Get('/check-token')
  checkToken(@Request() req: Request) {
    const user = req['user'];
    return this.authService.checkToken(user);
  }

}
