import { Controller, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //   @Post()
  //   createUser(@Body() body: CreateUserDto) {
  //     return this.usersService.createUser(body);
  //   }
}
