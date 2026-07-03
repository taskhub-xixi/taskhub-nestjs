import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { PrismaService } from "../../common/prisma.service";
import { JWTResponse } from "../../model/auth.model";
import {
  RefreshTokenResponse,
  RefreshTokenResponseQuery,
} from "../../model/token.model";
import { JwtPayload } from "../dto/payload-interface";

@Injectable()
export class TokenService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly jwtService: JwtService,
    private prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async UpdateToken(payload: JwtPayload, res: Response): Promise<JWTResponse> {
    this.logger.info(
      `AUTH_SERVICE.UpdateToken.START: ${JSON.stringify(payload)}`,
    );
    // DEFINE JWT PAYLOAD
    const jwtPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    const jwt = this.configService.get<string>("JWT_SECRET");

    // GENERATE TOKEN
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        expiresIn: "1h",
        secret: jwt,
      }),
      this.jwtService.signAsync(jwtPayload, {
        expiresIn: "7d",
        secret: jwt,
      }),
    ]);
    res.cookie("access_token", at, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.cookie("refresh_token", rt, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    // GET EXPIRES DATE AND SET DATE
    const createdAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    this.logger.info(`AUTH_SERVICE.UpdateToken.END: `);

    // RETURN VALUE
    return {
      access_token: at,
      refresh_token: rt,
      exp: expiresAt,
      createdAt: createdAt,
    };
  }

  deleteCookieToken(response: Response): void {
    response.clearCookie("refresh_token");
    response.clearCookie("access_token");
  }

  async refresh(
    oldRefreshToken: string,
    res: Response,
  ): Promise<RefreshTokenResponse> {
    this.logger.info(`AUTH_SERVICE.refresh: ${oldRefreshToken}`);

    const jwt = this.configService.get<string>("JWT_SECRET");
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      oldRefreshToken,
      {
        secret: jwt,
      },
    );

    this.logger.debug(`payload: ${JSON.stringify(payload)}`);
    // find id
    const [row] = await this.prismaService.$queryRaw<
      RefreshTokenResponseQuery[]
    >`SELECT u.id, u.email, at.expires_at, at.refresh_token_hash
      from users as u
      LEFT JOIN auth_tokens AS at ON u.id = at.user_id
      WHERE
      u.id = ${payload.sub} ;`;

    const user = {
      id: row.id,
      email: row.email,
      expires_at: row.expires_at,
      refresh_token_hash: row.refresh_token_hash,
    };

    this.logger.debug(JSON.stringify(`user: ${JSON.stringify(user)}`));

    // validate
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.refresh_token_hash) {
      throw new UnauthorizedException("Missing token");
    }

    if (!user.expires_at) {
      throw new UnauthorizedException("Missing token");
    }

    if (new Date() > user.expires_at) {
      throw new UnauthorizedException("Token expired");
    }

    const isMatch = await bcrypt.compare(
      oldRefreshToken,
      user?.refresh_token_hash,
    );

    if (!isMatch) {
      throw new HttpException("Token Invalid", 401);
    }

    // create token
    const token = await this.UpdateToken(payload, res);
    if (!token.refresh_token) {
      throw new HttpException("Token not generated", 400);
    }
    if (!token.access_token) {
      throw new HttpException("Token not generated", 400);
    }
    await this.updateRtHashDatabase(
      user.id,
      token.refresh_token,
      token.createdAt,
    );

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    };
  }

  async updateRtHashDatabase(
    id: string,
    rt: string,
    createAt?: Date,
    exp?: Date,
  ): Promise<number | undefined> {
    // GET EXPIRES DATE AND SET DATE
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    this.logger.info(`TOKEN_SERVICE.updateRtHashDatabase:  ${id}`);
    if (!id) {
      throw new HttpException("Something Wrong", 401);
    }
    const hash = await this.hash(rt);

    if (!exp) {
      this.logger.debug(`TOKEN_SERVICE.updateRtHash.access_token: ${rt}`);
      await this.prismaService.$executeRaw`
          INSERT INTO auth_tokens (user_id, refresh_token_hash, expires_at, created_at)
          VALUES (${id}, ${hash}, ${expiresAt}, ${createAt})
          ON DUPLICATE KEY UPDATE
          refresh_token_hash = ${hash}`;
    } else {
      this.logger.debug(`AUTH_SERVICE.updateRtHash.refresh_token: ${rt}`);
      return await this.prismaService.$executeRaw`
          INSERT INTO auth_tokens (user_id, refresh_token_hash, expires_at, created_at)
          VALUES (${id}, ${hash}, ${exp}, ${createAt})
          ON DUPLICATE KEY UPDATE
          refresh_token_hash = ${hash},
          expires_at = ${exp},
          created_at = ${createAt}`;
    }
  }

  // hash -> logic function helpers
  async hash(pass: string): Promise<string> {
    pass = await bcrypt.hash(pass, 12);
    return pass;
  }
}
