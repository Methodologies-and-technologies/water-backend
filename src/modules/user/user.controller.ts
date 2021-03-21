import {
  Controller,
  Get,
  Query,
  Delete,
  Put,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  ValidationPipe,
  Post,
} from '@nestjs/common';
import { UserService } from './services';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { PaginationUsersDto } from './dto/pagination-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { QueryParamsDto } from './dto/query-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UploadAvatarDto } from './dto';
import { ServiceRatingDto } from '../service-rating';
import { ResponseSuccess, SapAuthPayload } from '../auth/auth.interface';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned all users using pagination or query: (email, fullName, phoneNumber).',
  })
  public async getAllUsers(@Query() options?: QueryParamsDto): Promise<PaginationUsersDto> {
    return await this.userService.getManyUsers(options);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned a user via userId.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found user.',
  })
  public async getUserById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<UserEntity> {
    return await this.userService.getUserById(id);
  }

  @Get('/current')
  @ApiResponse({
    status: 200,
    description: 'Returned a user via fullName.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found user.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  public async findCurrentUser(@User() user: UserEntity): Promise<UserEntity> {
    return await this.userService.findUserByFullName(user.fullName);
  }

  @Put(':id')
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
  @ApiBody({ type: UpdateUserDto })
  public async updateUser(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body(new ValidationPipe()) data: UpdateUserDto,
    @User() user: UserEntity | SapAuthPayload,
  ): Promise<UserEntity> {
    return await this.userService.update(id, data, user);
  }

  @Put('/current')
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
  @ApiBody({ type: UpdateUserProfileDto })
  public async updateUserProfile(
    @User() user: UserEntity,
    @Body(new ValidationPipe()) data: UpdateUserProfileDto,
  ): Promise<UserEntity> {
    return await this.userService.updateUserProfile(user.id, data);
  }

  @Post('/profile/upload')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 201,
    description: 'Avatar was successfully uploaded',
  })
  @ApiBody({ type: UploadAvatarDto })
  public async createQuestion(
    @Body(new ValidationPipe()) fileDto: UploadAvatarDto,
    @User() user: UserEntity,
  ): Promise<UserEntity> {
    return await this.userService.uploadAvatar(user.id, fileDto);
  }

  @Post('/estimate-application')
  @ApiResponse({
    status: 201,
    description: 'The application has been successfully estimated.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request: rating or userId must be a number conforming to the specified constraints.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiBody({ type: ServiceRatingDto })
  public async estimateApplicationService(
    @Body(new ValidationPipe()) ratingPayload: ServiceRatingDto,
    @User() user: UserEntity,
  ): Promise<ResponseSuccess> {
    return await this.userService.estimateApplicationService(user.id, ratingPayload);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found user.',
  })
  public async destroyUser(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<UserEntity> {
    return await this.userService.destroy(id);
  }
}
