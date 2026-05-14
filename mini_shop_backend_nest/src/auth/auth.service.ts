import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(body: CreateUserDto) {
    const existingEmail = await this.usersService.findByEmail(body.email);

    if (existingEmail)
      throw new ConflictException({
        message: 'This email is already registered',
      });

    const existingUsername = await this.usersService.findByUsername(
      body.username,
    );

    if (existingUsername)
      throw new ConflictException({
        message: 'This username is already used.',
      });

    const user = await this.usersService.createUser(body);
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
    const user = body.identifier.includes('@')
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
