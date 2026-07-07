import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { PrismaService } from "../common/prisma.service";
import {
  DeleteDTO,
  LoginDTO,
  LoginResponse,
  LogoutDTO,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterDTO,
  RegisterResponse,
  UpdateDTO,
} from "../model/auth.model";
import { IAuthService } from "./interfaces/auth.service.interface";
import { TokenService } from "./services/token.service";

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  async create(request: RegisterDTO): Promise<RegisterResponse> {
    this.logger.info(`AUTH_SERVICE.create: ${JSON.stringify(request)}`);

    const userRegistered = await this.prismaService.users.findUnique({
      where: { email: request.email },
    });

    if (userRegistered) {
      throw new HttpException("email or password is invalid", 400);
    }

    const hashPassword = await this.tokenService.hash(request.password);
    await this.prismaService.$executeRaw`INSERT INTO users (email,
        password_hash,
        first_name,
        last_name,
        role,
        email_verified,
        is_active
    ) VALUES (${request.email}, ${hashPassword}, ${request.firstname}, ${request.lastname}, "public", ${request.email}, true) `;

    const data = await this.prismaService.users.findUnique({
      where: { email: request.email },
    });

    if (!data) {
      throw new HttpException("Data not created", 404);
    }

    return {
      data: {
        email: data.email,
        firstname: data.first_name,
        lastname: data.last_name,
        role: data.role,
      },
    };
  }

  async login(request: LoginDTO, res: Response): Promise<LoginResponse> {
    this.logger.info(`AUTH_SERVICE.login: ${JSON.stringify(request.email)}`);

    const data = await this.prismaService.users.findUnique({
      where: { email: request.email },
    });

    if (!data) {
      throw new HttpException("Email or password is invalid", 400);
    }

    const match = await bcrypt.compare(request.password, data.password_hash);

    if (!match) {
      throw new HttpException("Email or password is invalid", 400);
    }

    const payload = { sub: data.id, email: data.email, role: data.role };
    const token = await this.tokenService.UpdateToken(payload, res);

    if (!token.refresh_token) {
      throw new HttpException("Token Is not generated", 400);
    }
    if (!token.access_token) {
      throw new HttpException("Token Is not generated", 400);
    }
    if (!token.exp) {
      throw new HttpException("Token Is not generated", 400);
    }

    await this.tokenService.updateRtHashDatabase(
      payload.sub,
      token.refresh_token,
      token.createdAt,
      token.exp,
    );

    return {
      refresh_token: token.refresh_token,
      access_token: token.access_token,
      expiresIn: token.exp,
    };
  }

  async refresh(token: string, res: Response): Promise<RefreshTokenResponse> {
    const newToken = await this.tokenService.refresh(token, res);
    return newToken;
  }

  async verify(cookie: string): Promise<{ id: number }> {
    try {
      const data = await this.jwtService.verifyAsync<{ id: number }>(cookie);
      if (!data) {
        throw new HttpException("Unauthorized User", 401);
      }
      return data;
    } catch (err: unknown) {
      throw new UnauthorizedException(
        (err as Error).message || "unknown message",
      );
    }
  }

  async resetPassword(req: UpdateDTO): Promise<void> {
    if (!req.password) {
      throw new HttpException("Account is missing", 404);
    }
    const data = await this.prismaService.users.findUnique({
      where: { email: req.email },
    });
    if (data === null) {
      throw new HttpException("Account is missing", 404);
    }
    if (data?.email === null) {
      throw new HttpException("Account is missing", 404);
    }
    const hashPassword = await this.tokenService.hash(req.password);
    await this.prismaService.$executeRaw`
      UPDATE users SET password_hash = ${hashPassword} WHERE email = ${data.email}`;
  }

  // logout
  async logout(logoutDTO: LogoutDTO, res: Response): Promise<LogoutResponse> {
    const data = await this.prismaService.users.findUnique({
      where: { email: logoutDTO.email },
    });
    if (!data) {
      throw new HttpException("Account is missing", 404);
    }

    await this.prismaService.$executeRaw`
      DELETE FROM auth_token WHERE user_id = ${data.id}`;

    this.tokenService.deleteCookieToken(res);
    return {
      data: {
        message: "Logout Suuccesfully",
      },
    };
  }

  async delete(
    deleteDTO: DeleteDTO,
    response: Response,
  ): Promise<{ message: string }> {
    const data = await this.prismaService.users.findUnique({
      where: { email: deleteDTO.email },
    });

    if (!data) {
      throw new HttpException("Account not found", 404);
    }

    await this.prismaService.users.delete({ where: { email: data.email } });

    const makeSure = await this.prismaService.users.findUnique({
      where: { email: data.email },
    });

    if (makeSure) {
      throw new HttpException("Account is not deleted", 403);
    }

    return {
      message: "account deleted",
    };
  }

  // validate Guard --> logic function
  async validateUser(email: string, pass: string) {
    const user = await this.prismaService.users.findUnique({
      where: { email },
    });
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    throw new HttpException(
      "AUTH_SERVICE.validateUser: Unauthorized Exception",
      400,
    );
  }

  async getUserByEmail(email: string) {
    const user = await this.prismaService.users.findUnique({
      where: { email },
    });

    return user;
  }

  async checkRole(email: string) {
    const data = await this.prismaService.users.findUnique({
      where: { email },
    });
    if (!data) {
      throw new HttpException("Forbidden resources, Role must be Admin", 403);
    }
    if (data.role !== "admin") {
      throw new HttpException("Forbidden resources, Role must be Admin", 403);
    }
    return data;
  }
  // =============== VALIDATE FUNCTION =====================
}
