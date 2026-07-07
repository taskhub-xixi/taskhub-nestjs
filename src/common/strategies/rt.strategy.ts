import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../../auth/interfaces/payload-interface";

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.access_token,
      ]),
      ignoreExpiration: true,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
      passReqToCallback: false,
    });
  }

  // GET RFERSH TOKEN
  validate(payload: JwtPayload) {
    console.log(payload);
    return {
      ...payload,
    };
  }
}
