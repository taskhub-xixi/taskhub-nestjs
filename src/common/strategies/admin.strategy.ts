import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../../auth/auth.service";
import { JwtPayload } from "../../auth/interfaces/payload-interface";

@Injectable()
export class UserStrategy extends PassportStrategy(Strategy, "admin") {
  constructor(
    private authService: AuthService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.access_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.email) {
      throw new HttpException("Unauthorized", 401);
    }

    const user = await this.authService.getUserByEmail(payload.email);
    if (!user) {
      throw new HttpException("Unauthorized", 401);
    }

    return {
      user,
      ...payload,
    };
  }
}
