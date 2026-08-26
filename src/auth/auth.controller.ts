import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RTGuard } from '../common/guards/rt-token.guard'
import {
  CookiePayload,
  DeleteDTO,
  LoginDTO,
  LoginResponse,
  LogoutDTO,
  RefreshTokenResponse,
  RegisterDTO,
  RegisterResponse,
  UpdateDTO,
  VerifyResponseToken,
} from '../model/auth.model'
import { WebResponse } from '../model/web.model'
import { AuthService } from './auth.service'

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDTO: RegisterDTO,
  ): Promise<WebResponse<RegisterResponse>> {
    const result = await this.authService.create(registerDTO)
    return {
      data: result,
      statusCode: HttpStatus.CREATED,
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDTO: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebResponse<LoginResponse>> {
    const result = await this.authService.login(loginDTO, res)

    return {
      data: {
        access_token: result.access_token,
        expiresIn: result.expiresIn,
        refresh_token: result.refresh_token,
      },
      statusCode: HttpStatus.OK,
    }
  }

  @UseGuards(RTGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebResponse<RefreshTokenResponse>> {
    const refreshToken = req.cookies['refresh_token']

    if (!refreshToken) {
      throw new HttpException(`AUTH_CONTROLLER.refresh: ${refreshToken}`, 401)
    }

    const tokens = await this.authService.refresh(refreshToken, res)

    return {
      data: tokens,
      statusCode: HttpStatus.OK,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetDTO: UpdateDTO): Promise<WebResponse<void>> {
    if (!resetDTO.email) throw new HttpException('Something Wrong', 404)
    if (!resetDTO.password) throw new HttpException('Something Wrong', 404)
    await this.authService.resetPassword(resetDTO)
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Body() deleteDTO: DeleteDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<void>> {
    const result = await this.authService.delete(deleteDTO, response)

    return {
      message: result.message,
      statusCode: HttpStatus.OK,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Req() request: Request,
  ): Promise<WebResponse<VerifyResponseToken>> {
    const cookie = (request.cookies as CookiePayload).accessToken
    const result = await this.authService.verify(cookie)
    return {
      data: result,
      statusCode: HttpStatus.OK,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() deleteDTO: LogoutDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebResponse<void>> {
    await this.authService.logout(deleteDTO, res)
    return {
      message: 'clear Cookie',
      statusCode: HttpStatus.OK,
    }
  }
}
