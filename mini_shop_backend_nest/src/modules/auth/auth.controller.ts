import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { AuthResponseDto } from './dto/auth-response.dto';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /// ---registerUser---

  @ApiOperation({ summary: 'Register a new user.' })
  @ApiResponse({
    status: 201,
    description: 'User registration successful.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email/Username already used.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @Post('/register')
  async registerUser(@Body() body: RegisterUserDto) {
    return this.authService.registerUser(body);
  }

  /// ---loginUser---

  @ApiOperation({ summary: 'Login user.' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({
    status: 401,
    description: 'Wrong username, email or password.',
  })
  @HttpCode(200)
  @Post('/login')
  async loginUser(@Body() body: LoginUserDto) {
    return this.authService.loginUser(body);
  }

  /// ---getMe---

  @ApiOperation({ summary: 'Get user data.' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user data.',
    type: CurrentUserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @ApiBearerAuth()
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser | undefined) {
    return user;
  }
}
