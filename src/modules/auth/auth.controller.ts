import { Body, Controller, HttpCode, HttpStatus, Post, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './services';
import { AuthResponse, ResponseSuccess, SapJwtResponse } from './auth.interface';
import {
  RegisterDto,
  LoginDto,
  ResendConfirmationCodeDto,
  RefreshAccessTokenDto,
  LogoutDto,
} from './dto';
import { VerifyDto } from './dto/verify-phone-number.dto';
import { LoginSapDto } from './dto/login-sap.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @ApiResponse({
    status: 201,
    description: 'The temporary user has been successfully created, please pass validation.',
  })
  @ApiResponse({
    status: 409,
    description: 'Validation failed: (fullName, email, phoneNumber), has already been taken.',
  })
  @ApiBody({ type: RegisterDto })
  public register(@Body(new ValidationPipe()) credentials: RegisterDto): Promise<ResponseSuccess> {
    return this.authService.register(credentials);
  }

  @Post('/sap/login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'The SAP is successfully logged in.',
  })
  @ApiResponse({
    status: 409,
    description: 'Validation failed: (fullName, email, phoneNumber), has already been taken.',
  })
  @ApiBody({ type: LoginSapDto })
  public loginSap(@Body(ValidationPipe) credentials: LoginSapDto): Promise<SapJwtResponse> {
    return this.authService.loginSap(credentials);
  }

  @Post('/login')
  @ApiResponse({
    status: 200,
    description: 'The user successfully logged in.',
  })
  @ApiResponse({
    status: 409,
    description: 'Invalid credentials: (phoneNumber), please fill in correct one.',
  })
  @ApiBody({ type: LoginDto })
  public login(@Body(new ValidationPipe()) credentials: LoginDto): Promise<ResponseSuccess> {
    return this.authService.login(credentials);
  }

  @Post('/verify-confirmation-code')
  @ApiResponse({
    status: 200,
    description: 'The code was successfully confirmed.',
  })
  @ApiResponse({
    status: 409,
    description: 'Invalid credentials.',
  })
  @ApiBody({ type: VerifyDto })
  public verify(@Body(new ValidationPipe()) credentials: VerifyDto): Promise<AuthResponse> {
    return this.authService.completeVerificationAndGetToken(credentials);
  }

  @Post('/send-confirmation-code')
  @ApiResponse({
    status: 200,
    description: 'Confirmation code was send.',
  })
  @ApiResponse({
    status: 409,
    description: 'Invalid phone number.',
  })
  @ApiBody({ type: ResendConfirmationCodeDto })
  public sendConfirmationCode(
    @Body(new ValidationPipe()) credentials: ResendConfirmationCodeDto,
  ): Promise<ResponseSuccess> {
    return this.authService.resendConfirmationCode(credentials);
  }

  @Post('/logout')
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'Invalid refreshToken.',
  })
  @ApiBody({ type: LogoutDto })
  public logout(@Body(new ValidationPipe()) credentials: LogoutDto): Promise<ResponseSuccess> {
    return this.authService.logout(credentials);
  }

  @Post('/refresh-access-token')
  @ApiResponse({
    status: 200,
    description: 'New access token was generated successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'Invalid refreshToken.',
  })
  @ApiBody({ type: RefreshAccessTokenDto })
  public refreshAccessToken(
    @Body(new ValidationPipe()) credentials: RefreshAccessTokenDto,
  ): Promise<string> {
    return this.authService.refreshAccessToken(credentials.refreshToken);
  }
}
