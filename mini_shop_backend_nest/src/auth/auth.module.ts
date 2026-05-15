import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) throw new Error('JWT_SECRET is not configured.');

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    UsersModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  exports: [JwtModule],
})
export class AuthModule {}
