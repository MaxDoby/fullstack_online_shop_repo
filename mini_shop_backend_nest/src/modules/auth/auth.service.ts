import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { isEmail } from 'class-validator';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(body: RegisterUserDto) {
    const existingEmail = await this.usersService.findByEmail(body.email);

    if (existingEmail)
      throw new ConflictException({
        message: 'This email is already used.',
      });

    const existingUsername = await this.usersService.findByUsername(
      body.username,
    );

    if (existingUsername)
      throw new ConflictException({
        message: 'This username is already used.',
      });

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const userData = {
      username: body.username,
      email: body.email,
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
    };
    const user = await this.usersService.createUser(userData);

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { id, username, email, firstName, lastName, createdAt, updatedAt } =
      user;

    return {
      user: {
        id,
        username,
        email,
        firstName,
        lastName,
        createdAt,
        updatedAt,
      },
      accessToken,
    };
  }

  async loginUser(body: LoginUserDto) {
    const user = isEmail(body.identifier)
      ? await this.usersService.findByEmail(body.identifier)
      : await this.usersService.findByUsername(body.identifier);

    if (!user)
      throw new UnauthorizedException({ message: 'Wrong username or email.' });

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException({ message: 'Wrong password!' });

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { id, username, email, firstName, lastName, createdAt, updatedAt } =
      user;
    return {
      user: { id, username, email, firstName, lastName, createdAt, updatedAt },
      accessToken,
    };
  }
}
