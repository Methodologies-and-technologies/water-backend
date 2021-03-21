import { Controller, Put, Param, Body, UseGuards, ValidationPipe, Post } from '@nestjs/common';
import { UserService } from './services';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { SapCreateUserDto } from './dto/sap-create-user.dto';
import { UserSapDto } from './dto/user-sap.dto';
import { SapUpdateUserDto } from './dto/sap-update-user.dto';
import { SapUserResponseDto } from './dto/sap-user-response.dto';

@ApiTags('sap-users')
@Controller('sap/users')
export class SapUserController {
  constructor(private userService: UserService) {}

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found user.',
  })
  @ApiBody({ type: SapCreateUserDto })
  async createUser(
    @Body(new ValidationPipe()) data: SapCreateUserDto,
  ): Promise<SapUserResponseDto> {
    return await this.userService.createUserFromSap(data);
  }

  @Put(':sapId')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'User profile updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found user profile.',
  })
  @ApiBody({ type: SapUpdateUserDto })
  async updateUser(
    @Param('sapId') id: string,
    @Body(new ValidationPipe()) data: SapUpdateUserDto,
  ): Promise<SapUserResponseDto> {
    return await this.userService.updateUserFromSap(id, data);
  }
}
